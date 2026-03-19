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

@description('Mode WAF: Detection ou Prevention')
@allowed([
  'Detection'
  'Prevention'
])
param wafMode string = 'Prevention'

@description('Liste d\'adresses IP publiques a bloquer (ex: 1.2.3.4, 5.6.7.0/24)')
param blockedIpAddresses array = []

@description('Liste de codes pays ISO a bloquer (ex: RU, CN)')
param blockedCountryCodes array = []

@description('Seuil de limitation de debit par minute et par IP')
param rateLimitThreshold int = 120

var vnetName = 'vnet-${name}'
var subnetName = 'appgw-subnet'
var publicIpName = 'pip-${name}'
var wafPolicyName = 'waf-${name}'
var frontendProbeId = resourceId('Microsoft.Network/applicationGateways/probes', name, 'frontend-probe')
var apiProbeId = resourceId('Microsoft.Network/applicationGateways/probes', name, 'api-probe')
var frontendIpConfigId = resourceId('Microsoft.Network/applicationGateways/frontendIPConfigurations', name, 'publicFrontendIp')
var httpPortId = resourceId('Microsoft.Network/applicationGateways/frontendPorts', name, 'port-80')
var frontendPoolId = resourceId('Microsoft.Network/applicationGateways/backendAddressPools', name, 'frontend-pool')
var apiPoolId = resourceId('Microsoft.Network/applicationGateways/backendAddressPools', name, 'api-pool')
var frontendSettingsId = resourceId('Microsoft.Network/applicationGateways/backendHttpSettingsCollection', name, 'frontend-settings')
var apiSettingsId = resourceId('Microsoft.Network/applicationGateways/backendHttpSettingsCollection', name, 'api-settings')
var httpListenerId = resourceId('Microsoft.Network/applicationGateways/httpListeners', name, 'http-listener')
var pathMapId = resourceId('Microsoft.Network/applicationGateways/urlPathMaps', name, 'app-path-map')

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
      mode: wafMode
      requestBodyCheck: true
      fileUploadLimitInMb: 100
      maxRequestBodySizeInKb: 128
    }
    customRules: {
      rules: concat(
        [
          {
            name: 'rate-limit-per-ip'
            priority: 10
            ruleType: 'RateLimitRule'
            action: 'Block'
            state: 'Enabled'
            rateLimitDuration: 'OneMin'
            rateLimitThreshold: rateLimitThreshold
            groupByUserSession: [
              {
                groupByVariables: [
                  {
                    variableName: 'ClientAddr'
                  }
                ]
              }
            ]
            matchConditions: [
              {
                matchVariables: [
                  {
                    variableName: 'RequestUri'
                  }
                ]
                operator: 'Contains'
                matchValues: [
                  '/'
                ]
              }
            ]
          }
        ],
        length(blockedIpAddresses) > 0
          ? [
              {
                name: 'block-listed-ips'
                priority: 20
                ruleType: 'MatchRule'
                action: 'Block'
                state: 'Enabled'
                matchConditions: [
                  {
                    matchVariables: [
                      {
                        variableName: 'RemoteAddr'
                      }
                    ]
                    operator: 'IPMatch'
                    matchValues: blockedIpAddresses
                  }
                ]
              }
            ]
          : [],
        length(blockedCountryCodes) > 0
          ? [
              {
                name: 'geo-filter-block-countries'
                priority: 30
                ruleType: 'MatchRule'
                action: 'Block'
                state: 'Enabled'
                matchConditions: [
                  {
                    matchVariables: [
                      {
                        variableName: 'RemoteAddr'
                      }
                    ]
                    operator: 'GeoMatch'
                    matchValues: blockedCountryCodes
                  }
                ]
              }
            ]
          : []
      )
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

resource appGateway 'Microsoft.Network/applicationGateways@2022-09-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'WAF_v2'
      tier: 'WAF_v2'
      capacity: 1
    }
    enableHttp2: true
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
    frontendPorts: [
      {
        name: 'port-80'
        properties: {
          port: 80
        }
      }
    ]
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
          path: '/api/health'
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
    httpListeners: [
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
    ]
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
    requestRoutingRules: [
      {
        name: 'path-based-routing-rule'
        properties: {
          priority: 100
          ruleType: 'PathBasedRouting'
          httpListener: {
            id: httpListenerId
          }
          urlPathMap: {
            id: pathMapId
          }
        }
      }
    ]
    firewallPolicy: {
      id: wafPolicy.id
    }
  }
}

@description('IP publique de l\'Application Gateway')
output publicIpAddress string = publicIp.properties.ipAddress

@description('URL du frontend via Application Gateway')
output frontendUrl string = 'http://${publicIp.properties.ipAddress}'

@description('URL du backend API via Application Gateway')
output apiUrl string = 'http://${publicIp.properties.ipAddress}/api'

@description('Nom de l\'Application Gateway')
output appGatewayName string = appGateway.name
