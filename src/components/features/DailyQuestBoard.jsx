// src/components/features/DailyQuestBoard.jsx
/**
 * Daily Quest Board - Gamified daily goals with visual progress
 * Emotional storytelling through quest narratives
 */

import React from 'react';
import { Target, Star, Gift, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function DailyQuestBoard({ compact = false }) {
  const [quests, setQuests] = React.useState([]);
  const [streak, setStreak] = React.useState(3);

  React.useEffect(() => {
    // Generate daily quests (would come from game state in production)
    const dailyQuests = [
      {
        id: 'feed-3',
        title: 'Breakfast, Lunch & Dinner',
        description: 'Feed your dog 3 times today',
        icon: '🍖',
        progress: 2,
        goal: 3,
        xp: 50,
        coins: 20,
        category: 'care',
        rarity: 'common',
      },
      {
        id: 'play-5min',
        title: 'Playtime Champion',
        description: 'Play with your dog for 5 minutes',
        icon: '🎾',
        progress: 3,
        goal: 5,
        xp: 75,
        coins: 30,
        category: 'social',
        rarity: 'rare',
      },
      {
        id: 'training',
        title: 'Learning Together',
        description: 'Complete a training session',
        icon: '🎓',
        progress: 0,
        goal: 1,
        xp: 100,
        coins: 50,
        category: 'skill',
        rarity: 'rare',
      },
    ];
    setQuests(dailyQuests);
  }, []);

  const completedQuests = quests.filter(q => q.progress >= q.goal).length;
  const totalQuests = quests.length;
  const completionRate = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0;

  if (compact) {
    return <CompactQuestBoard quests={quests} completedQuests={completedQuests} totalQuests={totalQuests} />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-6 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Daily Quests</h2>
                <p className="text-purple-100 text-sm">Complete to earn rewards!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{completedQuests}/{totalQuests}</div>
              <div className="text-xs text-purple-100">Completed</div>
            </div>
          </div>

          {/* Streak counter */}
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 inline-flex">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">{streak} Day Streak! 🔥</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 pt-4">
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out animate-shimmer"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-center">{Math.round(completionRate)}% Complete</p>
      </div>

      {/* Quest list */}
      <div className="p-6 space-y-4">
        {quests.map((quest, index) => (
          <QuestCard key={quest.id} quest={quest} index={index} />
        ))}
      </div>

      {/* Footer - Bonus reward */}
      {completedQuests === totalQuests && (
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-4 animate-bounceIn">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-yellow-600 animate-bounce" />
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900">All Quests Complete!</h3>
                <p className="text-sm text-yellow-700">Bonus: +100 XP & +50 Coins 🎉</p>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:scale-105 transition-transform">
                Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestCard({ quest, index }) {
  const isComplete = quest.progress >= quest.goal;
  const progressPercent = (quest.progress / quest.goal) * 100;

  const categoryColors = {
    care: 'from-green-400 to-emerald-400',
    social: 'from-blue-400 to-cyan-400',
    skill: 'from-purple-400 to-pink-400',
  };

  const rarityBorders = {
    common: 'border-gray-300',
    rare: 'border-blue-300',
    epic: 'border-purple-300',
    legendary: 'border-yellow-300',
  };

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 ${rarityBorders[quest.rarity]}
        bg-gradient-to-r from-white to-gray-50
        transition-all duration-300 hover:shadow-lg hover:scale-102
        ${isComplete ? 'opacity-75' : ''}
        animate-slideInUp
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Complete overlay */}
      {isComplete && (
        <div className="absolute inset-0 bg-green-500/10 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
          <CheckCircle className="w-16 h-16 text-green-500 animate-bounceIn" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`
          w-14 h-14 rounded-xl
          bg-gradient-to-br ${categoryColors[quest.category]}
          flex items-center justify-center text-3xl
          shadow-lg animate-heartbeat
        `}>
          {quest.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{quest.title}</h3>
              <p className="text-sm text-gray-600">{quest.description}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-purple-600 font-semibold">
                <Star className="w-4 h-4 fill-purple-600" />
                {quest.xp} XP
              </div>
              <div className="text-xs text-gray-500">{quest.coins} coins</div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Progress: {quest.progress}/{quest.goal}
              </span>
              <span className={`font-semibold ${isComplete ? 'text-green-600' : 'text-purple-600'}`}>
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`
                  absolute inset-y-0 left-0 rounded-full
                  transition-all duration-500 ease-out
                  ${isComplete 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                    : `bg-gradient-to-r ${categoryColors[quest.category]}`
                  }
                `}
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactQuestBoard({ quests, completedQuests, totalQuests }) {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          <span className="font-semibold">Daily Quests</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">{completedQuests}/{totalQuests}</span>
          {completedQuests === totalQuests && <Gift className="w-5 h-5 animate-bounce" />}
        </div>
      </div>
      <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-500"
          style={{ width: `${(completedQuests / totalQuests) * 100}%` }}
        />
      </div>
    </div>
  );
}
