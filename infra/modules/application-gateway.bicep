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
var frontendProbeId = resourceId('Microsoft.Network/applicationGateways/probes', name, 'frontend-probe')
var apiProbeId = resourceId('Microsoft.Network/applicationGateways/probes', name, 'api-probe')
var frontendIpConfigId = resourceId('Microsoft.Network/applicationGateways/frontendIPConfigurations', name, 'publicFrontendIp')
var httpPortId = resourceId('Microsoft.Network/applicationGateways/frontendPorts', name, 'port-80')
var httpsPortId = resourceId('Microsoft.Network/applicationGateways/frontendPorts', name, 'port-443')
var sslCertId = resourceId('Microsoft.Network/applicationGateways/sslCertificates', name, 'gateway-ssl-cert')
var frontendPoolId = resourceId('Microsoft.Network/applicationGateways/backendAddressPools', name, 'frontend-pool')
var apiPoolId = resourceId('Microsoft.Network/applicationGateways/backendAddressPools', name, 'api-pool')
var frontendSettingsId = resourceId('Microsoft.Network/applicationGateways/backendHttpSettingsCollection', name, 'frontend-settings')
var apiSettingsId = resourceId('Microsoft.Network/applicationGateways/backendHttpSettingsCollection', name, 'api-settings')
var httpListenerId = resourceId('Microsoft.Network/applicationGateways/httpListeners', name, 'http-listener')
var httpsListenerId = resourceId('Microsoft.Network/applicationGateways/httpListeners', name, 'https-listener')
var pathMapId = resourceId('Microsoft.Network/applicationGateways/urlPathMaps', name, 'app-path-map')
var redirectConfigId = resourceId('Microsoft.Network/applicationGateways/redirectConfigurations', name, 'http-to-https-redirect')

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
  parent: virtualNetwork
  name: subnetName
  properties: {
    addressPrefix: appGatewaySubnetPrefix
  }
}

resource publicIp 'Microsoft.Network/publicIPAddresses@2023-09-01' = {
  name: publicIpName
  location: location
  tags: tags
  sku: {
    name: 'Standard'
    tier: 'Regional'
  }
  properties: {
    publicIPAllocationMethod: 'Static'
    publicIPAddressVersion: 'IPv4'
  }
}

resource wafPolicy 'Microsoft.Network/ApplicationGatewayWebApplicationFirewallPolicies@2023-09-01' = {
  name: wafPolicyName
  location: location
  tags: tags
  properties: {
    policySettings: {
      state: 'Enabled'
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
  sku: {
    name: 'WAF_v2'
    tier: 'WAF_v2'
    capacity: 1
  }
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
            id: frontendProbeId
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
            id: apiProbeId
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
              id: frontendIpConfigId
            }
            frontendPort: {
              id: httpPortId
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
              id: frontendIpConfigId
            }
            frontendPort: {
              id: httpsPortId
            }
            protocol: 'Https'
            sslCertificate: {
              id: sslCertId
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
            id: frontendPoolId
          }
          defaultBackendHttpSettings: {
            id: frontendSettingsId
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
                  id: apiPoolId
                }
                backendHttpSettings: {
                  id: apiSettingsId
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
            id: httpsListenerId
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
              id: httpListenerId
            }
            redirectConfiguration: {
              id: redirectConfigId
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
                ? httpsListenerId
                : httpListenerId
            }
            urlPathMap: {
              id: pathMapId
            }
          }
        }
      ]
    )
    firewallPolicy: {
      id: wafPolicy.id
    }
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
