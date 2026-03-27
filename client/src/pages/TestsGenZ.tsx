/**
 * Gen Z Tests Page - Challenge Yourself
 * Take tests, earn badges, track progress
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { 
  Test, loadTests, getAllTestProgress, getTestStats,
  checkAndExpireTests
} from '../lib/tests';
import { useCredits } from '../context/CreditsContext';
import {
  Trophy, Target, Clock, CheckCircle, Lock, ChevronRight,
  Star, Zap, Sparkles, AlertTriangle, Search
} from 'lucide-react';

export default function TestsGenZ() {
  const [, setLocation] = useLocation();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [expiredChannels, setExpiredChannels] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const progress = getAllTestProgress();
  const stats = getTestStats();
  const { balance, formatCredits } = useCredits();

  useEffect(() => {
    const initTests = async () => {
      const expired = await checkAndExpireTests();
      setExpiredChannels(expired);
      const t = await loadTests();
      setTests(t);
      setLoading(false);
    };
    initTests();
  }, []);

  const passedCount = Object.values(progress).filter(p => p.passed && !p.expired).length;
  const expiredCount = Object.values(progress).filter(p => p.expired).length;

  // Filter tests based on search query
  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.channelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.channelId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SEOHead
        title="Tests - Challenge Yourself 🎯"
        description="Take knowledge tests and earn badges"
        canonical="https://open-interview.github.io/tests"
      />

      <AppLayout>
        <div className="min-h-screen" style={{ backgroundColor: 'hsl(0 0% 0%)', color: 'hsl(0 0% 98%)' }}>
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 mb-12"
            >
              <h1 className="text-6xl md:text-7xl font-black">
                Test your
                <br />
                <span className="bg-gradient-to-r from-[hsl(190,100%,50%)] to-[hsl(270,100%,65%)] bg-clip-text text-transparent">
                  knowledge
                </span>
              </h1>
              <p className="text-xl" style={{ color: 'hsl(0 0% 75%)' }}>
                Prove what you know 💪
              </p>
            </motion.div>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'hsl(0 0% 53%)' }} />
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 backdrop-blur-xl rounded-[var(--radius-xl)] text-[hsl(0 0% 98%)] placeholder:text-[hsl(0 0% 53%)] focus:outline-none transition-colors"
                  style={{ 
                    backgroundColor: 'hsl(0 0% 8%)', 
                    border: '1px solid hsl(0 0% 12%)' 
                  }}
                />
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-6 backdrop-blur-xl rounded-[var(--radius-xl)]"
                style={{ 
                  background: 'linear-gradient(135deg, hsla(142, 76%, 36%, 0.2) 0%, hsla(142, 76%, 46%, 0.2) 100%)',
                  border: '1px solid hsla(142, 76%, 36%, 0.3)'
                }}
              >
                <Trophy className="w-8 h-8 mb-2" style={{ color: 'hsl(142, 76%, 46%)' }} />
                <div className="text-3xl font-black">{passedCount}</div>
                <div className="text-sm" style={{ color: 'hsl(0 0% 75%)' }}>Passed</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-6 backdrop-blur-xl rounded-[var(--radius-xl)]"
                style={{ 
                  background: 'linear-gradient(135deg, hsla(190, 100%, 40%, 0.2) 0%, hsla(190, 100%, 50%, 0.2) 100%)',
                  border: '1px solid hsla(190, 100%, 40%, 0.3)'
                }}
              >
                <Target className="w-8 h-8 mb-2" style={{ color: 'hsl(190, 100%, 50%)' }} />
                <div className="text-3xl font-black">{stats.totalAttempts}</div>
                <div className="text-sm" style={{ color: 'hsl(0 0% 75%)' }}>Attempts</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 backdrop-blur-xl rounded-[var(--radius-xl)]"
                style={{ 
                  background: 'linear-gradient(135deg, hsla(270, 100%, 55%, 0.2) 0%, hsla(270, 100%, 65%, 0.2) 100%)',
                  border: '1px solid hsla(270, 100%, 55%, 0.3)'
                }}
              >
                <Star className="w-8 h-8 mb-2" style={{ color: 'hsl(270, 100%, 65%)' }} />
                <div className="text-3xl font-black">{stats.averageScore}%</div>
                <div className="text-sm" style={{ color: 'hsl(0 0% 75%)' }}>Avg Score</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="p-6 backdrop-blur-xl rounded-[var(--radius-xl)]"
                style={{ 
                  background: 'linear-gradient(135deg, hsla(38, 92%, 50%, 0.2) 0%, hsla(38, 92%, 60%, 0.2) 100%)',
                  border: '1px solid hsla(38, 92%, 50%, 0.3)'
                }}
              >
                <Zap className="w-8 h-8 mb-2" style={{ color: 'hsl(38, 92%, 50%)' }} />
                <div className="text-3xl font-black">{formatCredits(balance)}</div>
                <div className="text-sm" style={{ color: 'hsl(0 0% 75%)' }}>Credits</div>
              </motion.div>
            </div>

            {/* Tests Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">⏳</div>
                <p style={{ color: 'hsl(0 0% 75%)' }}>Loading tests...</p>
              </div>
            ) : filteredTests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2">No tests found</h3>
                <p style={{ color: 'hsl(0 0% 75%)' }}>Try a different search term</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test, i) => {
                  const testProgress = progress[test.channelId];
                  const isPassed = testProgress?.passed && !testProgress?.expired;
                  const isExpired = testProgress?.expired;

                  return (
                    <motion.button
                      key={test.channelId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(i * 0.05, 0.5) }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setLocation(`/test/${test.channelId}`)}
                      className="group relative p-6 backdrop-blur-xl rounded-[var(--radius-xl)] transition-all text-left overflow-hidden"
                      style={{ 
                        backgroundColor: 'hsl(0 0% 8%)', 
                        border: '1px solid hsl(0 0% 12%)'
                      }}
                    >
                      {/* Background gradient */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ 
                          background: 'linear-gradient(135deg, hsla(190, 100%, 50%, 0.1) 0%, hsla(270, 100%, 65%, 0.1) 100%)' 
                        }} 
                      />

                      <div className="relative space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div 
                              className="text-xs font-semibold mb-1 uppercase tracking-wider"
                              style={{ color: 'hsl(190, 100%, 50%)' }}
                            >
                              {test.channelName}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{test.title}</h3>
                            <div className="flex items-center gap-2 text-sm" style={{ color: 'hsl(0 0% 75%)' }}>
                              <Clock className="w-4 h-4" />
                              <span>{test.questions.length} questions</span>
                            </div>
                          </div>

                          {isPassed && (
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(142, 76%, 46%) 100%)' }}
                            >
                              <CheckCircle className="w-5 h-5" style={{ color: 'hsl(0 0% 98%)' }} />
                            </div>
                          )}

                          {isExpired && (
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg, hsl(25, 95%, 55%) 0%, hsl(0, 84%, 60%) 100%)' }}
                            >
                              <AlertTriangle className="w-5 h-5" style={{ color: 'hsl(0 0% 98%)' }} />
                            </div>
                          )}
                        </div>

                        {/* Progress */}
                        {testProgress && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span style={{ color: 'hsl(0 0% 75%)' }}>Best Score</span>
                              <span className="font-bold">{testProgress.bestScore}%</span>
                            </div>
                            <div 
                              className="h-2 rounded-full overflow-hidden"
                              style={{ backgroundColor: 'hsl(0 0% 12%)' }}
                            >
                              <div
                                className="h-full"
                                style={{ 
                                  width: `${testProgress.bestScore}%`,
                                  background: 'linear-gradient(90deg, hsl(190, 100%, 50%) 0%, hsl(270, 100%, 65%) 100%)'
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* CTA */}
                        <div className="flex items-center justify-between pt-2">
                          <span 
                            className="text-sm font-semibold"
                            style={{ color: 'hsl(190, 100%, 50%)' }}
                          >
                            {isPassed ? 'Retake Test' : isExpired ? 'Retake (Expired)' : 'Start Test'}
                          </span>
                          <ChevronRight 
                            className="w-5 h-5 group-hover:translate-x-1 transition-all" 
                            style={{ color: 'hsl(0 0% 75%)' }} 
                          />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}


          </div>
        </div>
      </AppLayout>
    </>
  );
}
