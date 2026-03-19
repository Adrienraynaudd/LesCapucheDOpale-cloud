@description('Nom de l\'Application Gateway')
param name string

@description('Localisation')
param location string

@description('Tags des ressources')
param tags object

@description('Prefixe CIDR du VNet dedie a l\'Application Gateway')
param vnetAddressPrefix string = '10.10.0.0/16'

@description('Prefixe CIDR du subnet dedie a l\'Application Gateway')
param appGatewaySubnetPrefix string = '10.10.1.0/24'

@description('FQDN du frontend cible')
param frontendFqdn string

@description('FQDN du backend cible')
param backendFqdn string

@description('Active l\'ecoute HTTPS sur la gateway (necessite un certificat PFX)')
param enableHttps bool = false

@description('Certificat TLS au format PFX encode en base64 (obligatoire si enableHttps=true)')
@secure()
param sslCertificateData string = ''

@description('Mot de passe du certificat TLS PFX (obligatoire si enableHttps=true)')
@secure()
param sslCertificatePassword string = ''

var vnetName = 'vnet-${name}'
var subnetName = 'appgw-subnet'
var publicIpName = 'pip-${name}'
var wafPolicyName = 'waf-${name}'

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2023-09-01' = {
  name: vnetName
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: [
        vnetAddressPrefix
      ]
    }
  }
}

resource appGatewaySubnet 'Microsoft.Network/virtualNetworks/subnets@2023-09-01' = {
  name: '${virtualNetwork.name}/${subnetName}'
  properties: {
    addressPrefix: appGatewaySubnetPrefix
  }
}

resource publicIp 'Microsoft.Network/publicIPAddresses@2023-09-01' = {
  name: publicIpName
  location: location
  tags: tags
  properties: {
    publicIPAllocationMethod: 'Static'
    publicIPAddressVersion: 'IPv4'
  }
  sku: {
    name: 'Standard'
    tier: 'Regional'
  }
}

resource wafPolicy 'Microsoft.Network/ApplicationGatewayWebApplicationFirewallPolicies@2023-09-01' = {
  name: wafPolicyName
  location: location
  tags: tags
  properties: {
    policySettings: {
      enabledState: 'Enabled'
      mode: 'Prevention'
      requestBodyCheck: true
      fileUploadLimitInMb: 100
      maxRequestBodySizeInKb: 128
    }
    managedRules: {
      managedRuleSets: [
        {
          ruleSetType: 'OWASP'
          ruleSetVersion: '3.2'
        }
      ]
    }
  }
}

resource appGateway 'Microsoft.Network/applicationGateways@2023-09-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    enableHttp2: true
    sslPolicy: {
      policyType: 'Predefined'
      policyName: 'AppGwSslPolicy20220101S'
    }
    gatewayIPConfigurations: [
      {
        name: 'appGatewayIpConfig'
        properties: {
          subnet: {
            id: appGatewaySubnet.id
          }
        }
      }
    ]
    frontendIPConfigurations: [
      {
        name: 'publicFrontendIp'
        properties: {
          publicIPAddress: {
            id: publicIp.id
          }
        }
      }
    ]
    frontendPorts: concat(
      [
        {
          name: 'port-80'
          properties: {
            port: 80
          }
        }
      ],
      enableHttps ? [
        {
          name: 'port-443'
          properties: {
            port: 443
          }
        }
      ] : []
    )
    sslCertificates: enableHttps ? [
      {
        name: 'gateway-ssl-cert'
        properties: {
          data: sslCertificateData
          password: sslCertificatePassword
        }
      }
    ] : []
    backendAddressPools: [
      {
        name: 'frontend-pool'
        properties: {
          backendAddresses: [
            {
              fqdn: frontendFqdn
            }
          ]
        }
      }
      {
        name: 'api-pool'
        properties: {
          backendAddresses: [
            {
              fqdn: backendFqdn
            }
          ]
        }
      }
    ]
    probes: [
      {
        name: 'frontend-probe'
        properties: {
          protocol: 'Https'
          path: '/'
          interval: 30
          timeout: 30
          unhealthyThreshold: 3
          pickHostNameFromBackendHttpSettings: true
          match: {
            statusCodes: [
              '200-399'
            ]
          }
        }
      }
      {
        name: 'api-probe'
        properties: {
          protocol: 'Https'
          path: '/health'
          interval: 30
          timeout: 30
          unhealthyThreshold: 3
          pickHostNameFromBackendHttpSettings: true
          match: {
            statusCodes: [
              '200-399'
            ]
          }
        }
      }
    ]
    backendHttpSettingsCollection: [
      {
        name: 'frontend-settings'
        properties: {
          port: 443
          protocol: 'Https'
          requestTimeout: 30
          pickHostNameFromBackendAddress: true
          probe: {
            id: '${appGateway.id}/probes/frontend-probe'
          }
        }
      }
      {
        name: 'api-settings'
        properties: {
          port: 443
          protocol: 'Https'
          requestTimeout: 30
          pickHostNameFromBackendAddress: true
          probe: {
            id: '${appGateway.id}/probes/api-probe'
          }
        }
      }
    ]
    httpListeners: concat(
      [
        {
          name: 'http-listener'
          properties: {
            frontendIPConfiguration: {
              id: '${appGateway.id}/frontendIPConfigurations/publicFrontendIp'
            }
            frontendPort: {
              id: '${appGateway.id}/frontendPorts/port-80'
            }
            protocol: 'Http'
          }
        }
      ],
      enableHttps ? [
        {
          name: 'https-listener'
          properties: {
            frontendIPConfiguration: {
              id: '${appGateway.id}/frontendIPConfigurations/publicFrontendIp'
            }
            frontendPort: {
              id: '${appGateway.id}/frontendPorts/port-443'
            }
            protocol: 'Https'
            sslCertificate: {
              id: '${appGateway.id}/sslCertificates/gateway-ssl-cert'
            }
          }
        }
      ] : []
    )
    urlPathMaps: [
      {
        name: 'app-path-map'
        properties: {
          defaultBackendAddressPool: {
            id: '${appGateway.id}/backendAddressPools/frontend-pool'
          }
          defaultBackendHttpSettings: {
            id: '${appGateway.id}/backendHttpSettingsCollection/frontend-settings'
          }
          pathRules: [
            {
              name: 'api-rule'
              properties: {
                paths: [
                  '/api'
                  '/api/*'
                ]
                backendAddressPool: {
                  id: '${appGateway.id}/backendAddressPools/api-pool'
                }
                backendHttpSettings: {
                  id: '${appGateway.id}/backendHttpSettingsCollection/api-settings'
                }
              }
            }
          ]
        }
      }
    ]
    redirectConfigurations: enableHttps ? [
      {
        name: 'http-to-https-redirect'
        properties: {
          redirectType: 'Permanent'
          targetListener: {
            id: '${appGateway.id}/httpListeners/https-listener'
          }
          includePath: true
          includeQueryString: true
        }
      }
    ] : []
    requestRoutingRules: concat(
      enableHttps ? [
        {
          name: 'http-redirect-rule'
          properties: {
            priority: 90
            ruleType: 'Basic'
            httpListener: {
              id: '${appGateway.id}/httpListeners/http-listener'
            }
            redirectConfiguration: {
              id: '${appGateway.id}/redirectConfigurations/http-to-https-redirect'
            }
          }
        }
      ] : [],
      [
        {
          name: 'path-based-routing-rule'
          properties: {
            priority: 100
            ruleType: 'PathBasedRouting'
            httpListener: {
              id: enableHttps
                ? '${appGateway.id}/httpListeners/https-listener'
                : '${appGateway.id}/httpListeners/http-listener'
            }
            urlPathMap: {
              id: '${appGateway.id}/urlPathMaps/app-path-map'
            }
          }
        }
      ]
    )
    firewallPolicy: {
      id: wafPolicy.id
    }
  }
  sku: {
    name: 'WAF_v2'
    tier: 'WAF_v2'
    capacity: 1
  }
}

@description('IP publique de l\'Application Gateway')
output publicIpAddress string = publicIp.properties.ipAddress

@description('URL du frontend via Application Gateway')
output frontendUrl string = '${enableHttps ? 'https' : 'http'}://${publicIp.properties.ipAddress}'

@description('URL du backend API via Application Gateway')
output apiUrl string = '${enableHttps ? 'https' : 'http'}://${publicIp.properties.ipAddress}/api'

@description('Nom de l\'Application Gateway')
output appGatewayName string = appGateway.name
