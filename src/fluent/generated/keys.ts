import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '6a01110dad754dfd8721a96e6f46a038'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '93b543c5f5b64ed5b32096361ba82641'
                    }
                }
                composite: [
                    {
                        table: 'sys_ui_page'
                        id: '4b8ece05935f42f190a710616c26883d'
                        key: {
                            endpoint: 'x_1994889_csit440_incident_manager.do'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'c96711db7a25492a8a0f639424a9f6cf'
                        key: {
                            name: 'x_1994889_csit440/main'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'eb5db98cf2f142b3a59e6018ad2fd514'
                        key: {
                            name: 'x_1994889_csit440/main.js.map'
                        }
                    },
                ]
            }
        }
    }
}
