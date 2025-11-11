const axios = require('axios');

async function updateRecipeQuantities() {
  try {
    console.log('🔄 Đang cập nhật định lượng nguyên liệu...\n');
    
    const API_BASE_URL = 'http://46.250.231.129:8080';
    
    // ============================================
    // 1. CẬP NHẬT CƠM GÀ XỐI MỠ (Recipe ID: 1)
    // ============================================
    console.log('📝 1. Cập nhật: CƠM GÀ XỐI MỠ');
    console.log('─'.repeat(60));
    
    const comGaIngredients = [
      { recipeId: '1', ingreId: '1', quantity: 300, unitMeasurement: 'g' },    // Gạo
      { recipeId: '1', ingreId: '2', quantity: 500, unitMeasurement: 'g' },    // Gà
      { recipeId: '1', ingreId: '3', quantity: 50, unitMeasurement: 'g' },     // Cà rốt
      { recipeId: '1', ingreId: '4', quantity: 30, unitMeasurement: 'g' },     // Hành tây
      { recipeId: '1', ingreId: '5', quantity: 5, unitMeasurement: 'g' },      // Nghệ
      { recipeId: '1', ingreId: '6', quantity: 10, unitMeasurement: 'g' },     // Gừng
      { recipeId: '1', ingreId: '7', quantity: 15, unitMeasurement: 'g' },     // Tỏi
    ];
    
    for (const ingredient of comGaIngredients) {
      try {
        // Xóa cũ
        await axios.delete(
          `${API_BASE_URL}/api/RecipeDetail/${ingredient.recipeId.trim()}/${ingredient.ingreId.trim()}`
        ).catch(() => {}); // Bỏ qua lỗi nếu không tồn tại
        
        // Tạo mới với định lượng
        await axios.post(`${API_BASE_URL}/api/RecipeDetail`, {
          RecipeId: ingredient.recipeId,
          IngreId: ingredient.ingreId,
          Quantity: ingredient.quantity,
          UnitMeasurement: ingredient.unitMeasurement
        });
        
        console.log(`   ✅ ${ingredient.ingreId.trim()} - ${ingredient.quantity}${ingredient.unitMeasurement}`);
      } catch (error) {
        console.log(`   ❌ Lỗi khi cập nhật ${ingredient.ingreId}: ${error.message}`);
      }
    }
    
    // Cập nhật mô tả công thức
    try {
      await axios.put(`${API_BASE_URL}/api/Recipe/1`, {
        RecipeId: '1',
        FoodId: '1',
        RecipeDescription: 'Cơm gà Hải Nam truyền thống với gà luộc mềm, cơm thơm mùi hành và gừng, ăn kèm nước chấm đặc biệt'
      });
      console.log('   ✅ Đã cập nhật mô tả công thức\n');
    } catch (error) {
      console.log('   ⚠️ Không thể cập nhật mô tả\n');
    }
    
    // ============================================
    // 2. TẠO CÔNG THỨC MỚI: PHỞ BÒ
    // ============================================
    console.log('📝 2. Tạo công thức mới: PHỞ BÒ');
    console.log('─'.repeat(60));
    
    // Kiểm tra xem có món Phở bò không
    const foodsRes = await axios.get(`${API_BASE_URL}/api/FoodInfo`);
    const foods = foodsRes.data;
    const phoBo = foods.find(f => f.foodName && f.foodName.toLowerCase().includes('phở'));
    
    if (phoBo) {
      console.log(`   Tìm thấy món: ${phoBo.foodName} (ID: ${phoBo.foodId.trim()})`);
      
      // Tạo recipe mới
      const newRecipeId = 'RCP' + Date.now().toString().slice(-7);
      
      try {
        await axios.post(`${API_BASE_URL}/api/Recipe`, {
          RecipeId: newRecipeId,
          FoodId: phoBo.foodId.trim(),
          RecipeDescription: 'Phở bò Hà Nội với nước dùng ninh từ xương, thịt bò tươi ngon, bánh phở mềm'
        });
        console.log(`   ✅ Đã tạo công thức ID: ${newRecipeId}`);
        
        // Thêm nguyên liệu cho Phở
        const phoIngredients = [
          { ingreId: '8', quantity: 200, unitMeasurement: 'g', name: 'Bánh phở' },
          { ingreId: '9', quantity: 150, unitMeasurement: 'g', name: 'Thịt bò' },
          { ingreId: '6', quantity: 20, unitMeasurement: 'g', name: 'Gừng' },
          { ingreId: '4', quantity: 50, unitMeasurement: 'g', name: 'Hành tây' },
        ];
        
        for (const ing of phoIngredients) {
          try {
            await axios.post(`${API_BASE_URL}/api/RecipeDetail`, {
              RecipeId: newRecipeId,
              IngreId: ing.ingreId,
              Quantity: ing.quantity,
              UnitMeasurement: ing.unitMeasurement
            });
            console.log(`   ✅ ${ing.name} - ${ing.quantity}${ing.unitMeasurement}`);
          } catch (error) {
            console.log(`   ⚠️ ${ing.name}: ${error.response?.data?.title || error.message}`);
          }
        }
        console.log('');
      } catch (error) {
        console.log(`   ❌ Không thể tạo công thức: ${error.response?.data?.title || error.message}\n`);
      }
    } else {
      console.log('   ⚠️ Không tìm thấy món Phở trong database\n');
    }
    
    // ============================================
    // 3. TẠO CÔNG THỨC: BÚN BÒ HUẾ
    // ============================================
    console.log('📝 3. Tạo công thức mới: BÚN BÒ HUẾ');
    console.log('─'.repeat(60));
    
    const bunBo = foods.find(f => f.foodName && f.foodName.toLowerCase().includes('bún'));
    
    if (bunBo) {
      console.log(`   Tìm thấy món: ${bunBo.foodName} (ID: ${bunBo.foodId.trim()})`);
      
      const newRecipeId = 'RCP' + Date.now().toString().slice(-7);
      
      try {
        await axios.post(`${API_BASE_URL}/api/Recipe`, {
          RecipeId: newRecipeId,
          FoodId: bunBo.foodId.trim(),
          RecipeDescription: 'Bún bò Huế với nước dùng đậm đà, sả thơm, chân giò mềm'
        });
        console.log(`   ✅ Đã tạo công thức ID: ${newRecipeId}`);
        
        const bunBoIngredients = [
          { ingreId: '9', quantity: 200, unitMeasurement: 'g', name: 'Thịt bò' },
          { ingreId: '7', quantity: 20, unitMeasurement: 'g', name: 'Tỏi' },
          { ingreId: '4', quantity: 30, unitMeasurement: 'g', name: 'Hành' },
        ];
        
        for (const ing of bunBoIngredients) {
          try {
            await axios.post(`${API_BASE_URL}/api/RecipeDetail`, {
              RecipeId: newRecipeId,
              IngreId: ing.ingreId,
              Quantity: ing.quantity,
              UnitMeasurement: ing.unitMeasurement
            });
            console.log(`   ✅ ${ing.name} - ${ing.quantity}${ing.unitMeasurement}`);
          } catch (error) {
            console.log(`   ⚠️ ${ing.name}: ${error.response?.data?.title || error.message}`);
          }
        }
        console.log('');
      } catch (error) {
        console.log(`   ❌ Không thể tạo công thức: ${error.response?.data?.title || error.message}\n`);
      }
    } else {
      console.log('   ⚠️ Không tìm thấy món Bún trong database\n');
    }
    
    // ============================================
    // KIỂM TRA KẾT QUẢ
    // ============================================
    console.log('═'.repeat(60));
    console.log('🔍 KIỂM TRA KẾT QUẢ');
    console.log('═'.repeat(60));
    
    // Lấy lại công thức Cơm gà
    const verifyRes = await axios.get(`${API_BASE_URL}/api/Recipe/1`);
    const updatedRecipe = verifyRes.data;
    
    console.log('\n✅ CƠM GÀ XỐI MỠ (sau khi cập nhật):');
    console.log(`   Mô tả: ${updatedRecipe.recipeDescription}`);
    console.log(`   Số nguyên liệu: ${updatedRecipe.recipeDetails?.length || 0}`);
    
    if (updatedRecipe.recipeDetails && updatedRecipe.recipeDetails.length > 0) {
      updatedRecipe.recipeDetails.forEach((detail, i) => {
        console.log(`   ${i + 1}. ${detail.ingredientName}: ${detail.quantity || 'N/A'} ${detail.unitMeasurement || ''}`);
      });
    }
    
    // Kiểm tra tất cả recipes
    const allRecipesRes = await axios.get(`${API_BASE_URL}/api/Recipe`);
    const allRecipes = allRecipesRes.data;
    
    console.log(`\n📊 TỔNG KẾT:`);
    console.log(`   Tổng số công thức: ${allRecipes.length}`);
    allRecipes.forEach((r, i) => {
      const hasQuantity = r.recipeDetails?.some(rd => rd.quantity && rd.quantity > 0);
      console.log(`   ${i + 1}. ${r.foodName} - ${r.recipeDetails?.length || 0} NL ${hasQuantity ? '✅' : '⚠️'}`);
    });
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ HOÀN THÀNH!');
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

updateRecipeQuantities();
