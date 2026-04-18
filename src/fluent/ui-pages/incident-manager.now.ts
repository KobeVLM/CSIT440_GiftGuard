import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import giftGuardPage from '../../client/index.html'

UiPage({
    $id: Now.ID['incident-manager-page'], // Reuses existing registered UI Page record
    endpoint: 'x_1994889_csit440_incident_manager.do',
    description: 'GiftGuard — Gift Card Fraud Protection Portal',
    category: 'general',
    html: giftGuardPage,
    direct: true,
})
