import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Apple, 
  Dumbbell, 
  Heart, 
  Leaf,
  Clock,
  Target,
  Star,
  CheckCircle2,
  Play,
  ExternalLink
} from 'lucide-react'
import Button from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'

const Recommendations = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [completedItems, setCompletedItems] = useState([])

  const categories = [
    { id: 'all', name: 'All', icon: BookOpen, color: 'luna' },
    { id: 'nutrition', name: 'Nutrition', icon: Apple, color: 'green' },
    { id: 'fitness', name: 'Fitness', icon: Dumbbell, color: 'blue' },
    { id: 'wellness', name: 'Wellness', icon: Heart, color: 'pink' },
    { id: 'pcos', name: 'PCOS Care', icon: Leaf, color: 'purple' }
  ]

  const recommendations = [
    // Nutrition
    {
      id: 1,
      category: 'nutrition',
      priority: 'high',
      title: 'Anti-Inflammatory Breakfast Bowl',
      description: 'Start your day with a hormone-balancing breakfast rich in omega-3s and fiber',
      timeframe: '15 minutes',
      difficulty: 'Easy',
      phaseSpecific: 'Perfect for your luteal phase',
      ingredients: ['Chia seeds', 'Berries', 'Greek yogurt', 'Walnuts', 'Cinnamon'],
      instructions: [
        'Mix 2 tbsp chia seeds with almond milk',
        'Let sit for 10 minutes until gel-like',
        'Top with berries, yogurt, and walnuts',
        'Sprinkle cinnamon for blood sugar control'
      ],
      benefits: 'Reduces inflammation, stabilizes blood sugar, supports hormone production',
      scientificBacking: 'Studies show omega-3s reduce PCOS symptoms by 40%'
    },
    {
      id: 2,
      category: 'nutrition',
      priority: 'medium',
      title: 'Spearmint Tea for Hormone Balance',
      description: 'Natural way to reduce excess androgens and support clearer skin',
      timeframe: '5 minutes',
      difficulty: 'Easy',
      phaseSpecific: 'Beneficial throughout your cycle',
      ingredients: ['Organic spearmint tea', 'Hot water', 'Optional: honey'],
      instructions: [
        'Steep 1-2 tea bags in hot water for 5-7 minutes',
        'Drink 2 cups daily between meals',
        'Add raw honey if desired for taste'
      ],
      benefits: 'Lowers testosterone levels, improves acne, reduces hirsutism',
      scientificBacking: 'Clinical trials show 23% reduction in androgen levels'
    },
    // Fitness
    {
      id: 3,
      category: 'fitness',
      priority: 'high',
      title: 'PCOS-Friendly HIIT Routine',
      description: 'Short bursts of exercise that improve insulin sensitivity without overtraining',
      timeframe: '20 minutes',
      difficulty: 'Medium',
      phaseSpecific: 'Best during follicular phase when energy is higher',
      exercises: [
        '30 seconds jumping jacks',
        '30 seconds bodyweight squats', 
        '30 seconds mountain climbers',
        '30 seconds rest'
      ],
      instructions: [
        'Warm up with light movement for 5 minutes',
        'Repeat circuit 4 times with 1 minute rest between rounds',
        'Cool down with gentle stretching'
      ],
      benefits: 'Improves insulin sensitivity, burns fat, boosts mood',
      scientificBacking: 'HIIT shown to reduce insulin resistance by 35% in PCOS women'
    },
    {
      id: 4,
      category: 'fitness',
      priority: 'medium',
      title: 'Restorative Yoga Flow',
      description: 'Gentle poses to reduce cortisol and support your nervous system',
      timeframe: '25 minutes',
      difficulty: 'Easy',
      phaseSpecific: 'Perfect for menstrual and luteal phases',
      poses: ['Child\'s pose', 'Cat-cow', 'Pigeon pose', 'Legs up the wall', 'Savasana'],
      instructions: [
        'Focus on deep, slow breathing throughout',
        'Hold each pose for 3-5 minutes',
        'Use props (bolsters, blankets) for comfort',
        'End with 5 minutes of meditation'
      ],
      benefits: 'Reduces stress hormones, improves sleep, eases cramps',
      scientificBacking: 'Yoga reduces cortisol by 27% in women with PCOS'
    },
    // Wellness
    {
      id: 5,
      category: 'wellness',
      priority: 'high',
      title: 'Circadian Rhythm Reset',
      description: 'Optimize your sleep-wake cycle for better hormone regulation',
      timeframe: 'Ongoing',
      difficulty: 'Medium',
      phaseSpecific: 'Especially important during luteal phase',
      steps: [
        'Wake up at the same time daily',
        'Get 10 minutes of morning sunlight',
        'Avoid screens 1 hour before bed',
        'Keep bedroom cool and dark'
      ],
      benefits: 'Improves sleep quality, regulates cortisol, supports ovulation',
      scientificBacking: 'Consistent sleep schedule reduces PCOS symptoms by 30%'
    },
    {
      id: 6,
      category: 'wellness',
      priority: 'medium',
      title: 'Stress-Busting Breathing Technique',
      description: '4-7-8 breathing to activate your parasympathetic nervous system',
      timeframe: '5 minutes',
      difficulty: 'Easy',
      phaseSpecific: 'Use anytime you feel stressed',
      instructions: [
        'Inhale through nose for 4 counts',
        'Hold breath for 7 counts',
        'Exhale through mouth for 8 counts',
        'Repeat 4-8 cycles'
      ],
      benefits: 'Reduces cortisol, lowers blood pressure, improves mood',
      scientificBacking: 'Breath work shown to reduce stress hormones by 45%'
    },
    // PCOS Specific
    {
      id: 7,
      category: 'pcos',
      priority: 'high',
      title: 'Inositol Supplementation Guide',
      description: 'Natural supplement that acts like insulin sensitizer for PCOS',
      timeframe: 'Daily routine',
      difficulty: 'Easy',
      phaseSpecific: 'Take consistently throughout cycle',
      dosage: '2g myo-inositol + 200mg d-chiro-inositol daily',
      timing: 'Split into two doses: morning and evening with food',
      benefits: 'Improves ovulation, reduces insulin resistance, supports weight management',
      scientificBacking: '70% of women see improved ovulation within 3 months',
      note: 'Consult healthcare provider before starting any supplements'
    },
    {
      id: 8,
      category: 'pcos',
      priority: 'medium',
      title: 'Seed Cycling for Hormone Balance',
      description: 'Use specific seeds to support hormone production in each cycle phase',
      timeframe: 'Monthly cycle',
      difficulty: 'Easy',
      phaseSpecific: 'Follows your natural hormone fluctuations',
      phases: {
        follicular: '1 tbsp pumpkin seeds + 1 tbsp flax seeds daily (days 1-14)',
        luteal: '1 tbsp sunflower seeds + 1 tbsp sesame seeds daily (days 15-28)'
      },
      benefits: 'Supports estrogen and progesterone balance, reduces PMS',
      scientificBacking: 'Lignans in flax seeds shown to support hormone metabolism'
    }
  ]

  const filteredRecommendations = activeCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === activeCategory)

  const toggleCompleted = (id) => {
    setCompletedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getCategoryColor = (category) => {
    switch(category) {
      case 'nutrition': return 'from-green-400 to-emerald-500'
      case 'fitness': return 'from-blue-400 to-blue-500'
      case 'wellness': return 'from-pink-400 to-rose-500'
      case 'pcos': return 'from-purple-400 to-purple-500'
      default: return 'from-luna-400 to-luna-500'
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Personalized Recommendations</h1>
        <p className="text-gray-600">Science-backed wellness guidance tailored to your cycle phase</p>
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        <Card className="bg-gradient-to-r from-luna-50 to-luna-100 border-luna-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-luna-600">{recommendations.length}</div>
            <div className="text-sm text-luna-700">Total Recommendations</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{completedItems.length}</div>
            <div className="text-sm text-green-700">Completed This Week</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">85%</div>
            <div className="text-sm text-purple-700">Implementation Score</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? 'luna-gradient text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-luna-300'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              <category.icon className="h-4 w-4 mr-2" />
              {category.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recommendations Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        <AnimatePresence>
          {filteredRecommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className={`h-full border-0 ${completedItems.includes(rec.id) ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-xl bg-gradient-to-r ${getCategoryColor(rec.category)}`}>
                      {rec.category === 'nutrition' && <Apple className="h-5 w-5 text-white" />}
                      {rec.category === 'fitness' && <Dumbbell className="h-5 w-5 text-white" />}
                      {rec.category === 'wellness' && <Heart className="h-5 w-5 text-white" />}
                      {rec.category === 'pcos' && <Leaf className="h-5 w-5 text-white" />}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(rec.priority)}`}>
                        {rec.priority} priority
                      </span>
                      <button
                        onClick={() => toggleCompleted(rec.id)}
                        className={`p-1 rounded-full transition-colors ${
                          completedItems.includes(rec.id)
                            ? 'text-green-500 bg-green-100'
                            : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <CardTitle className={completedItems.includes(rec.id) ? 'line-through text-gray-500' : ''}>
                    {rec.title}
                  </CardTitle>
                  <CardDescription>{rec.description}</CardDescription>
                  
                  {rec.phaseSpecific && (
                    <div className="bg-luna-100 text-luna-700 text-xs px-3 py-1 rounded-full w-fit">
                      🌙 {rec.phaseSpecific}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Quick Info */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {rec.timeframe}
                      </div>
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        {rec.difficulty}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 mb-1">Benefits:</h4>
                      <p className="text-sm text-blue-700">{rec.benefits}</p>
                    </div>

                    {/* Scientific Backing */}
                    {rec.scientificBacking && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-purple-800 mb-1 flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          Research Says:
                        </h4>
                        <p className="text-sm text-purple-700">{rec.scientificBacking}</p>
                      </div>
                    )}

                    {/* Ingredients/Steps Preview */}
                    {rec.ingredients && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 mb-2">Ingredients:</h4>
                        <div className="flex flex-wrap gap-1">
                          {rec.ingredients.slice(0, 3).map((ingredient, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {ingredient}
                            </span>
                          ))}
                          {rec.ingredients.length > 3 && (
                            <span className="text-xs text-gray-500">+{rec.ingredients.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Play className="h-3 w-3 mr-1" />
                        Start Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <BookOpen className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No recommendations found</h3>
          <p className="text-gray-500">Try selecting a different category</p>
        </div>
      )}
    </div>
  )
}

export default Recommendations
