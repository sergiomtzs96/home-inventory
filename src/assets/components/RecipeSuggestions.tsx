import { useState, useMemo, useEffect } from 'react';
import { ChefHat, Plus, ShoppingCart, X, Check, UtensilsCrossed, Filter, RotateCcw } from 'lucide-react';

const translateToEnglish = async (spanishText) => {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(spanishText)}&langpair=es|en`
    );
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
  } catch (err) {
    console.error('Translation error:', err);
  }
  return spanishText;
};

const ingredientKeywords = {
  'leche': 'milk', 'leche semidesnatada': 'milk', 'leche desnatada': 'milk', 'leche entera': 'milk', 'leche condensada': 'condensed milk',
  'huevo': 'egg', 'huevos': 'eggs',
  'pan': 'bread', 'pan integral': 'bread', 'pan rallado': 'breadcrumbs',
  'carne': 'beef', 'pollo': 'chicken', 'pasta': 'pasta', 'arroz': 'rice',
  'queso': 'cheese', 'tomate': 'tomato', 'tomates': 'tomatoes', 'cebolla': 'onion',
  'ajo': 'garlic', 'patata': 'potato', 'patatas': 'potatoes', 'zanahoria': 'carrot',
  'manzana': 'apple', 'platano': 'banana', 'naranja': 'orange', 'limon': 'lemon',
  'mantequilla': 'butter', 'aceite': 'oil', 'harina': 'flour', 'azucar': 'sugar',
  'sal': 'salt', 'pimienta': 'pepper', 'pescado': 'fish', 'salmon': 'salmon',
  'cerdo': 'pork', 'jamon': 'ham', 'tocino': 'bacon', 'nata': 'cream',
  'yogur': 'yogurt', 'chocolate': 'chocolate', 'cafe': 'coffee', 'vino': 'wine',
  'cerveza': 'beer', 'vinagre': 'vinegar', 'mayonesa': 'mayonnaise',
  'pimiento': 'pepper', 'berenjena': 'eggplant', 'calabaza': 'pumpkin',
  'guisantes': 'peas', 'maiz': 'corn', 'judias': 'beans', 'lentejas': 'lentils',
  'garbanzos': 'chickpeas', 'champiñones': 'mushrooms', 'brocoli': 'broccoli',
  'lechuga': 'lettuce', 'espinacas': 'spinach', 'aceitunas': 'olives',
  'pepino': 'cucumber', 'aguacate': 'avocado', 'fresas': 'strawberries',
  'mango': 'mango', 'sandia': 'watermelon', 'melon': 'melon',
  'pavo': 'turkey', 'macarrones': 'macaroni', 'pastel': 'cake',
  'galletas': 'cookies', 'galleta': 'cookie',
  'azúcar': 'sugar', 'crema': 'cream',
  'fideos': 'noodles', 'espaguetis': 'spaghetti',
  'sopa': 'soup', 'verdura': 'vegetable', 'verduras': 'vegetables',
  'fruta': 'fruit', 'frutas': 'fruits', 'zumo': 'juice', 'jugo': 'juice',
  'mermelada': 'jam', 'café': 'coffee',
  'tarta': 'cake', 'postre': 'dessert', 'budín': 'pudding', 'budin': 'pudding',
  'pasta de té': 'biscuits', 'pastas de té': 'biscuits', 'bizcocho': 'cake',
  'magdalena': 'muffin', 'donut': 'donut', 'croissant': 'croissant',
  'masa': 'dough', 'levadura': 'yeast',
};

const getMainIngredient = (productName) => {
  const lower = productName.toLowerCase().trim();
  
  for (const [key, value] of Object.entries(ingredientKeywords)) {
    if (lower.includes(key)) {
      return value;
    }
  }
  return null;
};

export default function RecipeSuggestions({ items = [], onAddToShoppingList }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [searchedIngredients, setSearchedIngredients] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [translating, setTranslating] = useState(false);
  const [ingredientFilter, setIngredientFilter] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);

  const expiringItems = useMemo(() => {
    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() + 5);
    return items.filter((item) => {
      if (!item.expiryDate) return false;
      if (item.category === 'Caducados') return false;
      const expiry = new Date(item.expiryDate);
      return expiry >= now && expiry <= limit;
    });
  }, [items]);

  const inventoryIngredients = useMemo(() => {
    return items.map((i) => i.name.toLowerCase()).filter(Boolean);
  }, [items]);

  const searchRecipes = async () => {
    if (expiringItems.length === 0) return;
    
    setLoading(true);
    setTranslating(true);
    setAllRecipes([]);
    setRecipes([]);
    setSearchedIngredients([]);
    setErrorMessage('');
    setHasSearched(true);

    const translatedNames = [];
    const processedIngredients = new Set();
    
    for (const item of expiringItems) {
      const mainIngredient = getMainIngredient(item.name);
      
      if (mainIngredient && !processedIngredients.has(mainIngredient)) {
        processedIngredients.add(mainIngredient);
        translatedNames.push({ original: item.name, translated: mainIngredient });
      } else if (!mainIngredient) {
        const translated = await translateToEnglish(item.name);
        if (translated && !processedIngredients.has(translated)) {
          processedIngredients.add(translated);
          translatedNames.push({ original: item.name, translated });
        }
      }
    }

    setTranslating(false);

    if (translatedNames.length === 0) {
      setErrorMessage('No se pudo identificar ningún ingrediente para buscar.');
      setLoading(false);
      return;
    }

    let recipesData = [];
    let searched = [];

    for (const { translated } of translatedNames) {
      if (!translated || translated.length < 2) continue;
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(translated)}`);
        const data = await res.json();
        if (data && data.meals && data.meals.length > 0) {
          const mapped = data.meals.map(m => ({ 
            ...m, 
            searchIngredient: translated,
            originalIngredient: translatedNames.find(t => t.translated === translated)?.original || translated
          }));
          recipesData = [...recipesData, ...mapped];
          searched.push(translated);
        }
      } catch (err) {
        console.error(`Error fetching recipes for ${translated}:`, err);
      }
    }

    const uniqueRecipes = recipesData.filter((recipe, index, self) => 
      index === self.findIndex((r) => r.idMeal === recipe.idMeal)
    );

    setAllRecipes(uniqueRecipes);
    setSearchedIngredients(searched);
    
    if (uniqueRecipes.length === 0) {
      setErrorMessage(`No se encontraron recetas para los ingredientes.`);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (hasSearched) {
      if (ingredientFilter === 'all') {
        setRecipes(allRecipes);
      } else {
        setRecipes(allRecipes.filter(r => r.searchIngredient === ingredientFilter));
      }
    }
  }, [ingredientFilter, allRecipes, hasSearched]);

  const fetchRecipeDetails = async (recipeId) => {
    setLoading(true);
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
      const data = await res.json();
      setSelectedRecipe(data.meals ? data.meals[0] : null);
    } catch (err) {
      console.error('Error fetching recipe details:', err);
    }
    setLoading(false);
  };

  const getIngredients = (recipe) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient.trim(),
          measure: measure ? measure.trim() : ''
        });
      }
    }
    return ingredients;
  };

  const checkIngredientInInventory = (ingredientName) => {
    const normalized = ingredientName.toLowerCase();
    return inventoryIngredients.some(inv => 
      normalized.includes(inv) || inv.includes(normalized)
    );
  };

  const getMissingIngredients = (ingredients) => {
    return ingredients.filter(ing => !checkIngredientInInventory(ing.name));
  };

  const addMissingToShoppingList = (ingredients) => {
    const missing = getMissingIngredients(ingredients);
    missing.forEach(ing => {
      onAddToShoppingList({ 
        name: ing.name, 
        quantity: 1, 
        category: 'Otros' 
      });
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#f9fafb', margin: 0, letterSpacing: '-0.01em' }}>
          Recetas sugeridas
        </h1>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: '22px', height: '22px', padding: '0 6px',
          borderRadius: '999px', fontSize: '0.7rem', fontWeight: '600',
          backgroundColor: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
        }}>{expiringItems.length}</span>
      </div>

      {expiringItems.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '12px', color: '#9ca3af', padding: '40px 20px',
          backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px',
        }}>
          <UtensilsCrossed size={40} strokeWidth={1.5} style={{ opacity: 0.5 }} />
          <p style={{ fontSize: '0.9rem', margin: 0, textAlign: 'center' }}>
            No hay productos próximos a caducar.<br />
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Añade productos con fecha de caducidad para ver recetas.</span>
          </p>
        </div>
      ) : (
        <>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap',
            padding: '12px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginRight: '4px' }}>Productos próximos a caducar:</span>
            {expiringItems.map((item) => (
              <span key={item.id} style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '4px 8px', borderRadius: '4px',
                fontSize: '0.75rem', backgroundColor: 'rgba(248,113,113,0.15)', color: '#fca5a5',
              }}>
                {item.name}
              </span>
            ))}
          </div>

          {!hasSearched && (
            <button
              onClick={searchRecipes}
              disabled={loading || translating}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px 20px', borderRadius: '8px', border: 'none',
                backgroundColor: '#021241', color: '#ffffff',
                fontSize: '0.875rem', fontWeight: '600', cursor: loading || translating ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.18s ease',
                opacity: loading || translating ? 0.7 : 1,
              }}
            >
              <ChefHat size={18} />
              {translating ? 'Traduciendo...' : loading ? 'Buscando recetas...' : 'Buscar recetas'}
            </button>
          )}

          {hasSearched && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} style={{ color: '#6b7280' }} />
                <select
                  value={ingredientFilter}
                  onChange={(e) => setIngredientFilter(e.target.value)}
                  style={{
                    padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: '#1e2028', color: '#f9fafb', fontSize: '0.8rem', cursor: 'pointer',
                  }}
                >
                  <option value="all">Todos ({allRecipes.length})</option>
                  {searchedIngredients.map(ing => (
                    <option key={ing} value={ing}>
                      {ing} ({allRecipes.filter(r => r.searchIngredient === ing).length})
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={searchRecipes}
                disabled={loading || translating}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'transparent', color: '#9ca3af',
                  fontSize: '0.75rem', cursor: loading || translating ? 'not-allowed' : 'pointer',
                }}
              >
                <RotateCcw size={14} />
                Actualizar
              </button>
            </div>
          )}

          {(errorMessage) && (
            <div style={{
              padding: '16px', textAlign: 'center', color: '#fca5a5',
              backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: '8px',
            }}>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>
                {errorMessage}
              </p>
            </div>
          )}

          {searchedIngredients.length > 0 && (
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
              Ingredientes buscados: {searchedIngredients.join(', ')}
            </p>
          )}

          {recipes.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px',
            }}>
              {recipes.map((recipe) => (
                <div
                  key={recipe.idMeal}
                  onClick={() => fetchRecipeDetails(recipe.idMeal)}
                  style={{
                    backgroundColor: '#1e2028',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <img
                    src={recipe.strMealThumb}
                    alt={recipe.strMeal}
                    style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '12px' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#f9fafb', margin: 0, lineHeight: 1.3 }}>
                      {recipe.strMeal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedRecipe && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#1e2028', borderRadius: '16px', maxWidth: '600px', width: '100%',
            maxHeight: '85vh', overflow: 'auto', position: 'relative',
          }}>
            <button
              onClick={() => setSelectedRecipe(null)}
              style={{
                position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)',
                border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              }}
            >
              <X size={20} />
            </button>

            <img
              src={selectedRecipe.strMealThumb}
              alt={selectedRecipe.strMeal}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />

            <div style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f9fafb', margin: '0 0 8px 0' }}>
                {selectedRecipe.strMeal}
              </h2>

              {selectedRecipe.strCategory && (
                <span style={{
                  display: 'inline-block', padding: '4px 10px', borderRadius: '4px',
                  fontSize: '0.75rem', backgroundColor: 'rgba(99,102,241,0.2)', color: '#a5b4fc', marginBottom: '16px',
                }}>
                  {selectedRecipe.strCategory} • {selectedRecipe.strArea}
                </span>
              )}

              {selectedRecipe.strInstructions && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f9fafb', margin: '0 0 8px 0' }}>
                    Instrucciones
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {selectedRecipe.strInstructions.substring(0, 400)}
                    {selectedRecipe.strInstructions.length > 400 ? '...' : ''}
                  </p>
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f9fafb', margin: '0 0 12px 0' }}>
                  Ingredientes
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {getIngredients(selectedRecipe).map((ing, idx) => {
                    const inInventory = checkIngredientInInventory(ing.name);
                    return (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '8px 10px', borderRadius: '6px',
                        backgroundColor: inInventory ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                      }}>
                        {inInventory ? (
                          <Check size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
                        ) : (
                          <Plus size={16} style={{ color: '#f87171', flexShrink: 0 }} />
                        )}
                        <span style={{ flex: 1, fontSize: '0.8rem', color: inInventory ? '#22c55e' : '#f9fafb' }}>
                          {ing.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {ing.measure}
                        </span>
                        <span style={{ 
                          fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px',
                          backgroundColor: inInventory ? 'rgba(34,197,94,0.2)' : 'rgba(248,113,113,0.2)',
                          color: inInventory ? '#22c55e' : '#f87171',
                        }}>
                          {inInventory ? 'Tienes' : 'Falta'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {getMissingIngredients(getIngredients(selectedRecipe)).length > 0 && (
                  <button
                    onClick={() => addMissingToShoppingList(getIngredients(selectedRecipe))}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      width: '100%', marginTop: '16px', padding: '12px', borderRadius: '8px',
                      border: 'none', backgroundColor: '#021241', color: '#ffffff',
                      fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
                    }}
                  >
                    <ShoppingCart size={18} />
                    Añadir ingredientes faltantes a la lista de compra
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}