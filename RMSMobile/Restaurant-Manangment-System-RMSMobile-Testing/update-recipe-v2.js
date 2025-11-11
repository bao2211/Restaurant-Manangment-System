const axios = require('axios');

async function updateRecipeQuantitiesV2() {
  try {
    console.log('🔄 Đang cập nhật định lượng nguyên liệu (V2)...\n');
    
    const API_BASE_URL = 'http://46.250.231.129:8080';
    
    // ============================================
    // CẬP NHẬT CƠM GÀ XỐI MỠ bằng PUT
    // ============================================
    console.log('📝 Cập nhật: CƠM GÀ XỐI MỠ');
    console.log('─'.repeat(60));
    
    const comGaIngredients = [
      { recipeId: '1         ', ingreId: '1         ', quantity: 300, unit: 'g', name: 'Gạo' },
      { recipeId: '1         ', ingreId: '2         ', quantity: 500, unit: 'g', name: 'Gà' },
      { recipeId: '1         ', ingreId: '3         ', quantity: 50, unit: 'g', name: 'Cà rốt' },
      { recipeId: '1         ', ingreId: '4         ', quantity: 30, unit: 'g', name: 'Hành tây' },
      { recipeId: '1         ', ingreId: '5         ', quantity: 5, unit: 'g', name: 'Nghệ' },
      { recipeId: '1         ', ingreId: '6         ', quantity: 10, unit: 'g', name: 'Gừng' },
      { recipeId: '1         ', ingreId: '7         ', quantity: 15, unit: 'g', name: 'Tỏi' },
    ];
    
    for (const ing of comGaIngredients) {
      try {
        // Sử dụng PUT để cập nhật
        const response = await axios.put(
          `${API_BASE_URL}/api/RecipeDetail/${ing.recipeId.trim()}/${ing.ingreId.trim()}`,
          {
            RecipeId: ing.recipeId,
            IngreId: ing.ingreId,
            Quantity: ing.quantity,
            UnitMeasurement: ing.unit
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
        
        console.log(`   ✅ ${ing.name}: ${ing.quantity}${ing.unit}`);
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`   ⚠️ ${ing.name}: Không tìm thấy (có thể chưa tồn tại)`);
        } else {
          console.log(`   ❌ ${ing.name}: ${error.response?.data?.title || error.message}`);
        }
      }
    }
    
    console.log('');
    
    // ============================================
    // KIỂM TRA KẾT QUẢ
    // ============================================
    console.log('═'.repeat(60));
    console.log('🔍 KIỂM TRA KẾT QUẢ');
    console.log('═'.repeat(60));
    
    const verifyRes = await axios.get(`${API_BASE_URL}/api/Recipe/1`);
    const updatedRecipe = verifyRes.data;
    
    console.log('\n✅ CƠM GÀ XỐI MỠ:');
    console.log(`   Mô tả: ${updatedRecipe.recipeDescription}`);
    console.log(`   Số nguyên liệu: ${updatedRecipe.recipeDetails?.length || 0}\n`);
    
    if (updatedRecipe.recipeDetails && updatedRecipe.recipeDetails.length > 0) {
      updatedRecipe.recipeDetails.forEach((detail, i) => {
        const qty = detail.quantity || 0;
        const unit = detail.unitMeasurement || '';
        const hasData = qty > 0;
        console.log(`   ${i + 1}. ${detail.ingredientName}: ${qty} ${unit} ${hasData ? '✅' : '⚠️'}`);
      });
    }
    
    console.log('\n' + '═'.repeat(60));
    
  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    if (error.response) {
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

updateRecipeQuantitiesV2();
