const axios = require('axios');

async function testLocalAPI() {
    console.log('=== TESTING LOCAL API SERVER (localhost:5181) ===');
    
    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
        // Test connection first
        console.log('Testing local API connection...');
        const connectionTest = await axios.get('http://localhost:5181/api/Category', { timeout: 5000 });
        console.log('✅ Local API is accessible');
        
        // Test the specific order endpoint
        console.log('\nTesting HD16D450CE order details...');
        const response = await axios.get('http://localhost:5181/api/OrderDetail/order/HD16D450CE', { timeout: 5000 });
        
        console.log('✅ Local API Request Successful');
        console.log('HTTP Status:', response.status);
        console.log('Data Length:', Array.isArray(response.data) ? response.data.length : 'N/A');
        
        if (Array.isArray(response.data) && response.data.length > 0) {
            const firstItem = response.data[0];
            
            console.log('\n=== LOCAL API RESPONSE ANALYSIS ===');
            console.log('Raw Item:', JSON.stringify(firstItem, null, 2));
            console.log('All Available Keys:', Object.keys(firstItem));
            
            console.log('\n=== STATUS FIELD CHECK ===');
            console.log('Has status property:', 'status' in firstItem);
            console.log('Status Field Value:', firstItem.status);
            console.log('Status Field Type:', typeof firstItem.status);
            
            if (firstItem.status !== undefined) {
                console.log('🎉 SUCCESS: STATUS FIELD FOUND IN LOCAL API!');
                console.log('Status Value:', firstItem.status);
                
                // Compare with production
                console.log('\n=== COMPARING LOCAL VS PRODUCTION ===');
                const prodResponse = await axios.get('http://46.250.231.129:8080/api/OrderDetail/order/HD16D450CE');
                const prodItem = prodResponse.data[0];
                
                console.log('Local Keys:', Object.keys(firstItem));
                console.log('Production Keys:', Object.keys(prodItem));
                console.log('Local has status field:', 'status' in firstItem);
                console.log('Production has status field:', 'status' in prodItem);
                console.log('Fix is working locally:', 'status' in firstItem && !('status' in prodItem));
                
            } else {
                console.log('❌ STATUS FIELD STILL MISSING IN LOCAL API');
            }
        }
        
    } catch (error) {
        console.error('❌ Local API Test Failed');
        console.error('Error:', error.code || error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Local API server might not be running yet.');
            console.log('Please ensure the local API server is started with: dotnet run');
        }
    }
}

testLocalAPI();