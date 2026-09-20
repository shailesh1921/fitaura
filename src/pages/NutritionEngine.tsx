import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Plus, Utensils, Clock, Trash2 } from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  hindi?: string;
  region: 'North Indian' | 'South Indian' | 'Bengali' | 'Gujarati' | 'Punjabi' | 'Pan-Indian';
  dietType: 'Vegetarian' | 'Vegan' | 'Eggetarian' | 'Non-Veg';
  calories: number; // per serving
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
  emoji: string;
}

const INDIAN_FOODS: FoodItem[] = [
  // North/Punjabi
  { id: '1', name: 'Paneer Bhurji', hindi: 'पनीर भुर्जी', region: 'Punjabi', dietType: 'Vegetarian', calories: 280, protein: 18, carbs: 12, fat: 18, fiber: 2, servingSize: '1 cup', emoji: '🧀' },
  { id: '2', name: 'Dal Tadka', hindi: 'दाल तड़का', region: 'North Indian', dietType: 'Vegan', calories: 220, protein: 12, carbs: 32, fat: 5, fiber: 10, servingSize: '1 bowl (150g)', emoji: '🍲' },
  { id: '3', name: 'Rajma Chawal', hindi: 'राजमा चावल', region: 'Punjabi', dietType: 'Vegan', calories: 350, protein: 12, carbs: 65, fat: 4, fiber: 12, servingSize: '1 plate', emoji: '🍛' },
  { id: '4', name: 'Chole Bhature', hindi: 'छोले भटूरे', region: 'Punjabi', dietType: 'Vegetarian', calories: 450, protein: 12, carbs: 55, fat: 20, fiber: 8, servingSize: '2 bhature + 1 cup chole', emoji: '🥘' },
  { id: '5', name: 'Aloo Paratha', hindi: 'आलू पराठा', region: 'Punjabi', dietType: 'Vegetarian', calories: 260, protein: 6, carbs: 35, fat: 10, fiber: 4, servingSize: '1 paratha', emoji: '🫓' },
  { id: '6', name: 'Dal Makhani', hindi: 'दाल मखनी', region: 'Punjabi', dietType: 'Vegetarian', calories: 320, protein: 14, carbs: 40, fat: 12, fiber: 12, servingSize: '1 bowl', emoji: '🍲' },
  { id: '7', name: 'Palak Paneer', hindi: 'पालक पनीर', region: 'Punjabi', dietType: 'Vegetarian', calories: 260, protein: 15, carbs: 10, fat: 18, fiber: 5, servingSize: '1 cup', emoji: '🥬' },
  { id: '8', name: 'Butter Chicken', hindi: 'बटर चिकन', region: 'Punjabi', dietType: 'Non-Veg', calories: 420, protein: 30, carbs: 12, fat: 28, fiber: 2, servingSize: '1 cup', emoji: '🍗' },
  { id: '9', name: 'Tandoori Chicken', hindi: 'तंदूरी चिकन', region: 'Punjabi', dietType: 'Non-Veg', calories: 260, protein: 35, carbs: 5, fat: 10, fiber: 1, servingSize: '2 pieces', emoji: '🍗' },
  
  // South Indian
  { id: '10', name: 'Idli', hindi: 'इडली', region: 'South Indian', dietType: 'Vegan', calories: 60, protein: 2, carbs: 12, fat: 0.5, fiber: 1, servingSize: '1 piece', emoji: '🍚' },
  { id: '11', name: 'Dosa', hindi: 'डोसा', region: 'South Indian', dietType: 'Vegan', calories: 130, protein: 3, carbs: 22, fat: 3, fiber: 2, servingSize: '1 piece', emoji: '🥞' },
  { id: '12', name: 'Sambar', hindi: 'सांभर', region: 'South Indian', dietType: 'Vegan', calories: 110, protein: 4, carbs: 18, fat: 3, fiber: 4, servingSize: '1 cup', emoji: '🥣' },
  { id: '13', name: 'Upma', hindi: 'उपमा', region: 'South Indian', dietType: 'Vegetarian', calories: 180, protein: 5, carbs: 30, fat: 5, fiber: 3, servingSize: '1 cup', emoji: '🍲' },
  { id: '14', name: 'Pongal', hindi: 'पोंगल', region: 'South Indian', dietType: 'Vegetarian', calories: 220, protein: 6, carbs: 35, fat: 6, fiber: 4, servingSize: '1 cup', emoji: '🍚' },
  { id: '15', name: 'Rasam', hindi: 'रसम', region: 'South Indian', dietType: 'Vegan', calories: 60, protein: 2, carbs: 10, fat: 2, fiber: 2, servingSize: '1 cup', emoji: '🥣' },
  { id: '16', name: 'Fish Curry (Kerala)', region: 'South Indian', dietType: 'Non-Veg', calories: 280, protein: 22, carbs: 10, fat: 16, fiber: 2, servingSize: '1 bowl', emoji: '🐟' },
  
  // West/Gujarati
  { id: '17', name: 'Poha', hindi: 'पोहा', region: 'Pan-Indian', dietType: 'Vegan', calories: 180, protein: 4, carbs: 35, fat: 3, fiber: 2, servingSize: '1 cup', emoji: '🥗' },
  { id: '18', name: 'Dhokla', hindi: 'ढोकला', region: 'Gujarati', dietType: 'Vegan', calories: 160, protein: 6, carbs: 25, fat: 4, fiber: 3, servingSize: '3 pieces', emoji: '🧽' },
  { id: '19', name: 'Thepla', hindi: 'थेपला', region: 'Gujarati', dietType: 'Vegetarian', calories: 110, protein: 3, carbs: 16, fat: 4, fiber: 2, servingSize: '1 piece', emoji: '🫓' },
  { id: '20', name: 'Undhiyu', hindi: 'उंधियू', region: 'Gujarati', dietType: 'Vegetarian', calories: 250, protein: 7, carbs: 30, fat: 12, fiber: 8, servingSize: '1 cup', emoji: '🥘' },

  // Bengali
  { id: '21', name: 'Fish Curry (Bengali)', hindi: 'माछेर झोल', region: 'Bengali', dietType: 'Non-Veg', calories: 240, protein: 20, carbs: 8, fat: 14, fiber: 1, servingSize: '1 bowl', emoji: '🐟' },
  { id: '22', name: 'Mishti Doi', region: 'Bengali', dietType: 'Vegetarian', calories: 180, protein: 5, carbs: 24, fat: 7, fiber: 0, servingSize: '100g', emoji: '🍨' },
  
  // Pan-Indian / Staples
  { id: '23', name: 'Roti / Chapati', hindi: 'रोटी', region: 'Pan-Indian', dietType: 'Vegan', calories: 85, protein: 3, carbs: 17, fat: 0.5, fiber: 2, servingSize: '1 piece', emoji: '🫓' },
  { id: '24', name: 'White Rice', hindi: 'सफेद चावल', region: 'Pan-Indian', dietType: 'Vegan', calories: 130, protein: 2, carbs: 28, fat: 0.3, fiber: 0.5, servingSize: '1 bowl (100g cooked)', emoji: '🍚' },
  { id: '25', name: 'Brown Rice', hindi: 'ब्राउन राइस', region: 'Pan-Indian', dietType: 'Vegan', calories: 110, protein: 2.5, carbs: 22, fat: 1, fiber: 2, servingSize: '1 bowl (100g cooked)', emoji: '🍚' },
  { id: '26', name: 'Khichdi', hindi: 'खिचड़ी', region: 'Pan-Indian', dietType: 'Vegetarian', calories: 210, protein: 8, carbs: 36, fat: 4, fiber: 5, servingSize: '1 bowl', emoji: '🥣' },
  { id: '27', name: 'Curd / Dahi', hindi: 'दही', region: 'Pan-Indian', dietType: 'Vegetarian', calories: 98, protein: 11, carbs: 4, fat: 4, fiber: 0, servingSize: '1 cup (100g)', emoji: '🥛' },
  { id: '28', name: 'Lassi (Sweet)', hindi: 'लस्सी', region: 'Punjabi', dietType: 'Vegetarian', calories: 180, protein: 6, carbs: 25, fat: 6, fiber: 0, servingSize: '1 glass', emoji: '🥤' },
  { id: '29', name: 'Buttermilk / Chaas', hindi: 'छाछ', region: 'Pan-Indian', dietType: 'Vegetarian', calories: 40, protein: 2, carbs: 4, fat: 1, fiber: 0, servingSize: '1 glass', emoji: '🥛' },
  { id: '30', name: 'Egg Bhurji', hindi: 'अंडा भुर्जी', region: 'Pan-Indian', dietType: 'Eggetarian', calories: 180, protein: 14, carbs: 4, fat: 12, fiber: 1, servingSize: '2 eggs', emoji: '🍳' },
  { id: '31', name: 'Chicken Biryani', hindi: 'चिकन बिरयानी', region: 'Pan-Indian', dietType: 'Non-Veg', calories: 480, protein: 22, carbs: 55, fat: 18, fiber: 3, servingSize: '1 plate', emoji: '🍛' },
  { id: '32', name: 'Veg Biryani', hindi: 'वेज बिरयानी', region: 'Pan-Indian', dietType: 'Vegetarian', calories: 350, protein: 8, carbs: 60, fat: 10, fiber: 6, servingSize: '1 plate', emoji: '🍛' },
  
  // Ingredients/Snacks/Proteins
  { id: '33', name: 'Whey Protein', region: 'Pan-Indian', dietType: 'Vegetarian', calories: 120, protein: 24, carbs: 2, fat: 1.5, fiber: 0, servingSize: '1 scoop (30g)', emoji: '💪' },
  { id: '34', name: 'Moong Dal (Cooked)', hindi: 'मूंग दाल', region: 'Pan-Indian', dietType: 'Vegan', calories: 105, protein: 7, carbs: 19, fat: 0.5, fiber: 5, servingSize: '1 bowl', emoji: '🥣' },
  { id: '35', name: 'Masoor Dal (Cooked)', hindi: 'मसूर दाल', region: 'Pan-Indian', dietType: 'Vegan', calories: 115, protein: 8, carbs: 20, fat: 0.5, fiber: 6, servingSize: '1 bowl', emoji: '🥣' },
  { id: '36', name: 'Banana', hindi: 'केला', region: 'Pan-Indian', dietType: 'Vegan', calories: 105, protein: 1, carbs: 27, fat: 0.3, fiber: 3, servingSize: '1 medium', emoji: '🍌' },
  { id: '37', name: 'Apple', hindi: 'सेब', region: 'Pan-Indian', dietType: 'Vegan', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4, servingSize: '1 medium', emoji: '🍎' },
  { id: '38', name: 'Boiled Chickpeas (Chole)', hindi: 'काबुली चना', region: 'Pan-Indian', dietType: 'Vegan', calories: 164, protein: 9, carbs: 27, fat: 2.5, fiber: 7, servingSize: '1 cup', emoji: '🧆' },
  { id: '39', name: 'Mixed Sprouts', hindi: 'अंकुरित अनाज', region: 'Pan-Indian', dietType: 'Vegan', calories: 90, protein: 8, carbs: 15, fat: 1, fiber: 5, servingSize: '1 cup', emoji: '🌱' },
  { id: '40', name: 'Roasted Peanuts', hindi: 'मूंगफली', region: 'Pan-Indian', dietType: 'Vegan', calories: 160, protein: 7, carbs: 5, fat: 14, fiber: 2.5, servingSize: '1/4 cup (30g)', emoji: '🥜' },
  { id: '41', name: 'Almonds', hindi: 'बादाम', region: 'Pan-Indian', dietType: 'Vegan', calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, servingSize: '1 oz (30g)', emoji: '🌰' },
];

const REGIONS = ['All', 'Pan-Indian', 'North Indian', 'Punjabi', 'South Indian', 'Gujarati', 'Bengali'];
const DIETS = ['All', 'Vegetarian', 'Vegan', 'Eggetarian', 'Non-Veg'];

export const NutritionEngine = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedDiet, setSelectedDiet] = useState('All');
  
  const [plate, setPlate] = useState<{ food: FoodItem; quantity: number }[]>([]);

  const filteredFoods = useMemo(() => {
    return INDIAN_FOODS.filter((food) => {
      const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (food.hindi && food.hindi.includes(searchQuery));
      const matchesRegion = selectedRegion === 'All' || food.region === selectedRegion;
      const matchesDiet = selectedDiet === 'All' || food.dietType === selectedDiet;
      return matchesSearch && matchesRegion && matchesDiet;
    });
  }, [searchQuery, selectedRegion, selectedDiet]);

  const plateTotals = useMemo(() => {
    return plate.reduce(
      (acc, item) => ({
        calories: acc.calories + item.food.calories * item.quantity,
        protein: acc.protein + item.food.protein * item.quantity,
        carbs: acc.carbs + item.food.carbs * item.quantity,
        fat: acc.fat + item.food.fat * item.quantity,
        items: acc.items + item.quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, items: 0 }
    );
  }, [plate]);

  const addToPlate = (food: FoodItem) => {
    setPlate(prev => {
      const existing = prev.find(item => item.food.id === food.id);
      if (existing) {
        return prev.map(item => item.food.id === food.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { food, quantity: 1 }];
    });
  };

  const clearPlate = () => setPlate([]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-32">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7000FF] to-[#00F0FF] mb-2">
            Hyper-Localized Nutrition Engine
          </h1>
          <p className="text-gray-400 font-sans">
            Build your personalized Indian meal plate with precise macro tracking.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search foods (e.g. Paneer, दाल...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#7000FF] focus:ring-1 focus:ring-[#7000FF] transition-all"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                <Filter size={20} className="text-[#00F0FF] mt-2 mr-1" />
                {REGIONS.map(region => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedRegion === region
                        ? 'bg-[#7000FF] text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                {DIETS.map(diet => (
                  <button
                    key={diet}
                    onClick={() => setSelectedDiet(diet)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedDiet === diet
                        ? 'bg-[#00F0FF] text-black'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Food Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          <AnimatePresence>
            {filteredFoods.map(food => (
              <motion.div
                key={food.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 hover:bg-white/[0.05] hover:border-[#7000FF]/50 transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{food.emoji}</span>
                    <div>
                      <h3 className="font-display font-semibold text-lg">{food.name}</h3>
                      <div className="flex gap-2 items-center text-sm text-gray-400">
                        {food.hindi && <span>{food.hindi}</span>}
                        <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                        <span className={food.dietType === 'Vegetarian' || food.dietType === 'Vegan' ? 'text-green-400' : food.dietType === 'Non-Veg' ? 'text-red-400' : 'text-yellow-400'}>
                          {food.dietType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => addToPlate(food)}
                    className="p-2 bg-white/5 rounded-full hover:bg-[#7000FF] transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="flex justify-between items-end mb-3">
                  <div>
                    <div className="text-2xl font-mono font-bold text-white">{food.calories} <span className="text-sm font-sans text-gray-400 font-normal">kcal</span></div>
                    <div className="text-sm text-gray-500">{food.servingSize}</div>
                  </div>
                </div>

                {/* Macro Bars */}
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <div className="w-12 text-gray-400">PRO {food.protein}g</div>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00F0FF]" style={{ width: `${(food.protein / 50) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <div className="w-12 text-gray-400">CAR {food.carbs}g</div>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: `${(food.carbs / 80) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <div className="w-12 text-gray-400">FAT {food.fat}g</div>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF3366]" style={{ width: `${(food.fat / 40) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredFoods.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No foods found for these filters.
            </div>
          )}
        </div>

        {/* Meal Timing Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <Clock className="text-[#7000FF]" /> Suggested Combos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { slot: 'Pre-Workout', time: '6:00 AM', combo: 'Banana + Black Coffee', emoji: '🍌☕' },
              { slot: 'Post-Workout', time: '8:30 AM', combo: 'Whey + Poha', emoji: '💪🥗' },
              { slot: 'Lunch', time: '1:00 PM', combo: 'Dal Tadka + Rice + Sabzi', emoji: '🍲🍚' },
              { slot: 'Dinner', time: '8:00 PM', combo: 'Paneer Bhurji + Roti', emoji: '🧀🫓' }
            ].map((meal, idx) => (
              <div key={idx} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                <div className="text-sm text-[#00F0FF] mb-1 font-mono">{meal.time}</div>
                <h4 className="font-semibold mb-2">{meal.slot}</h4>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span>{meal.emoji}</span>
                  {meal.combo}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Build My Plate Sticky Panel */}
      <AnimatePresence>
        {plate.length > 0 && (
          <motion.div
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-[65px] left-0 right-0 z-40 px-4 pb-4"
          >
            <div className="max-w-4xl mx-auto bg-black/80 backdrop-blur-xl border border-[#7000FF]/30 p-4 md:p-6 rounded-3xl shadow-[0_0_40px_rgba(112,0,255,0.15)] flex flex-col md:flex-row items-center gap-6">
              
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 rounded-full border-4 border-[#1A1A24] relative flex items-center justify-center overflow-hidden">
                   {/* Simplified visual macro ring replacement */}
                   <Utensils className="text-[#7000FF] z-10" />
                   <div className="absolute inset-0 border-[4px] border-[#00F0FF] rounded-full border-t-[#FF3366] border-r-yellow-400 rotate-45 opacity-50"></div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg">Your Plate</h3>
                  <p className="text-sm text-gray-400">{plateTotals.items} items selected</p>
                </div>
              </div>

              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-sm text-gray-400">Calories</div>
                  <div className="font-mono font-bold text-xl">{plateTotals.calories}</div>
                </div>
                <div>
                  <div className="text-sm text-[#00F0FF]">Pro</div>
                  <div className="font-mono font-bold text-xl">{Math.round(plateTotals.protein)}g</div>
                </div>
                <div>
                  <div className="text-sm text-yellow-400">Carbs</div>
                  <div className="font-mono font-bold text-xl">{Math.round(plateTotals.carbs)}g</div>
                </div>
                <div>
                  <div className="text-sm text-[#FF3366]">Fat</div>
                  <div className="font-mono font-bold text-xl">{Math.round(plateTotals.fat)}g</div>
                </div>
              </div>

              <button 
                onClick={clearPlate}
                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                title="Clear Plate"
              >
                <Trash2 size={20} />
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
