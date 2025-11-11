const axios = require('axios');

async function getComGaRecipe() {
  try {
    console.log('📡 Đang truy vấn database...\n');
    
    const response = await axios.get('http://46.250.231.129:8080/api/Recipe');
    const recipes = response.data;
    
    const comGa = recipes.find(r => 
      r.foodName && r.foodName.toLowerCase().includes('cơm gà')
    );
    
    if (comGa) {
      console.log('╔═══════════════════════════════════════════════════════╗');
      console.log('║          CÔNG THỨC: CƠM GÀ XỐI MỠ                    ║');
      console.log('╚═══════════════════════════════════════════════════════╝\n');
      
      console.log('📋 THÔNG TIN CÔNG THỨC:');
      console.log('   • Mã công thức:', comGa.recipeId.trim());
      console.log('   • Mã món ăn:', comGa.foodId.trim());
      console.log('   • Tên món:', comGa.foodName);
      console.log('   • Mô tả:', comGa.recipeDescription || 'Không có mô tả');
      
      console.log('\n🥘 NGUYÊN LIỆU VÀ ĐỊNH LƯỢNG:');
      console.log('─'.repeat(60));
      
      if (comGa.recipeDetails && comGa.recipeDetails.length > 0) {
        comGa.recipeDetails.forEach((detail, index) => {
          console.log(`\n${index + 1}. ${detail.ingredientName || 'Không rõ tên'}`);
          console.log(`   ├─ Mã nguyên liệu: ${detail.ingredientId?.trim() || 'N/A'}`);
          console.log(`   ├─ Số lượng: ${detail.quantity || 0}`);
          console.log(`   └─ Đơn vị: ${detail.unitMeasurement || 'không rõ'}`);
        });
        
        console.log('\n' + '─'.repeat(60));
        console.log(`📊 Tổng số nguyên liệu: ${comGa.recipeDetails.length} loại`);
      } else {
        console.log('   ⚠️  Chưa có nguyên liệu được định nghĩa');
      }
      
      console.log('\n' + '═'.repeat(60));
      
      // In ra JSON đầy đủ để debug
      console.log('\n📄 RAW DATA (JSON):');
      console.log(JSON.stringify(comGa, null, 2));
      
    } else {
      console.log('❌ Không tìm thấy món "Cơm gà xối mỡ" trong database');
      console.log('\n📋 Danh sách các món có trong database:');
      recipes.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.foodName} (ID: ${r.foodId.trim()})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi truy vấn database:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

getComGaRecipe();
