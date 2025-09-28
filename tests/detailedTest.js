const axios = require('axios');

async function detailedAPITest() {
    console.log('=== DETAILED API RESPONSE ANALYSIS ===');
    
    try {
        // Test the specific problematic order
        const response = await axios.get('http://46.250.231.129:8080/api/OrderDetail/order/HD16D450CE');
        
        console.log('✅ API Request Successful');
        console.log('HTTP Status:', response.status);
        console.log('Content-Type:', response.headers['content-type']);
        console.log('Data Type:', typeof response.data);
        console.log('Is Array:', Array.isArray(response.data));
        console.log('Data Length:', Array.isArray(response.data) ? response.data.length : 'N/A');
        
        if (Array.isArray(response.data) && response.data.length > 0) {
            const firstItem = response.data[0];
            
            console.log('\n=== FIRST ITEM ANALYSIS ===');
            console.log('Raw Item:', JSON.stringify(firstItem, null, 2));
            console.log('All Available Keys:', Object.keys(firstItem));
            console.log('Number of Keys:', Object.keys(firstItem).length);
            
            console.log('\n=== STATUS FIELD ANALYSIS ===');
            console.log('Status Field Value:', firstItem.status);
            console.log('Status Field Type:', typeof firstItem.status);
            console.log('Status === undefined:', firstItem.status === undefined);
            console.log('Status === null:', firstItem.status === null);
            console.log('Status === "":', firstItem.status === '');
            console.log('Has status property:', 'status' in firstItem);
            
            console.log('\n=== EXPECTED VS ACTUAL ===');
            console.log('Expected Keys: foodId, foodName, orderId, quantity, unitPrice, status');
            console.log('Actual Keys:', Object.keys(firstItem).join(', '));
            console.log('Missing Status Field:', !'status' in firstItem || firstItem.status === undefined);
            
            if (firstItem.status) {
                console.log('✅ STATUS FIELD FOUND:', firstItem.status);
            } else {
                console.log('❌ STATUS FIELD MISSING OR NULL');
            }
        } else {
            console.log('❌ No data returned or data is not an array');
        }
        
        // Also test the bulk endpoint
        console.log('\n=== TESTING BULK ENDPOINT ===');
        const bulkResponse = await axios.get('http://46.250.231.129:8080/api/OrderDetail');
        console.log('Bulk Endpoint Status:', bulkResponse.status);
        console.log('Bulk Data Count:', Array.isArray(bulkResponse.data) ? bulkResponse.data.length : 'N/A');
        
        if (Array.isArray(bulkResponse.data) && bulkResponse.data.length > 0) {
            const bulkSample = bulkResponse.data[0];
            console.log('Bulk Sample Keys:', Object.keys(bulkSample));
            console.log('Bulk Sample Status Field:', bulkSample.status);
            console.log('Bulk Sample Raw:', JSON.stringify(bulkSample, null, 2));
        }
        
    } catch (error) {
        console.error('❌ API Request Failed');
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
        }
    }
}

detailedAPITest();