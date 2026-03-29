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
  Star, Zap, Sparkles, AlertTriangle, Search, RefreshCw
} from 'lucide-react';

export default function TestsGenZ() {
  const [, setLocation] = useLocation();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expiredChannels, setExpiredChannels] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const progress = getAllTestProgress();
  const stats = getTestStats();
  const { balance, formatCredits } = useCredits();

  const loadTestsData = async () => {
    try {
      setError(null);
      const expired = await checkAndExpireTests();
      setExpiredChannels(expired);
      const t = await loadTests();
      setTests(t);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestsData();
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
        <div className="min-h-screen bg-background text-foreground">
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
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  knowledge
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
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
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <label htmlFor="tests-search" className="sr-only">Search tests</label>
                <input
                  id="tests-search"
                  type="text"
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                />
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-card border border-green-500/30 rounded-xl"
              >
                <Trophy className="w-8 h-8 mb-2 text-green-500" />
                <div className="text-3xl font-black">{passedCount}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-card border border-blue-500/30 rounded-xl"
              >
                <Target className="w-8 h-8 mb-2 text-blue-500" />
                <div className="text-3xl font-black">{stats.totalAttempts}</div>
                <div className="text-sm text-muted-foreground">Attempts</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-card border border-purple-500/30 rounded-xl"
              >
                <Star className="w-8 h-8 mb-2 text-purple-500" />
                <div className="text-3xl font-black">{stats.averageScore}%</div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="p-6 bg-card border border-amber-500/30 rounded-xl"
              >
                <Zap className="w-8 h-8 mb-2 text-amber-500" />
                <div className="text-3xl font-black">{formatCredits(balance)}</div>
                <div className="text-sm text-muted-foreground">Credits</div>
              </motion.div>
            </div>

            {/* Tests Grid */}
            {loading ? (
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                  <div className="text-4xl mb-4">⏳</div>
                  <p className="text-muted-foreground">Loading tests...</p>
                </div>
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center min-h-[50vh] text-center"
              >
                <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl mb-6 max-w-md">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Failed to load tests</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                </div>
                <button
                  onClick={loadTestsData}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </motion.div>
            ) : filteredTests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center min-h-[50vh]"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold mb-2">No tests found</h3>
                  <p className="text-muted-foreground">Try a different search term</p>
                </div>
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
                      className="group relative p-6 bg-card border border-border hover:border-primary/50 rounded-xl transition-all text-left overflow-hidden"
                    >
                      {/* Background gradient */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/10 to-purple-500/10"
                      />

                      <div className="relative space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold mb-1 uppercase tracking-wider text-primary truncate min-w-0">
                              {test.channelName}
                            </div>
                            <h3 className="text-xl font-bold mb-2 truncate min-w-0">{test.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{test.questions.length} questions</span>
                            </div>
                          </div>

                          {isPassed && (
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                          )}

                          {isExpired && (
                            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Progress */}
                        {testProgress && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Best Score</span>
                              <span className="font-bold">{testProgress.bestScore}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-purple-500"
                                style={{ width: `${testProgress.bestScore}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* CTA */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-sm font-semibold text-primary">
                            {isPassed ? 'Retake Test' : isExpired ? 'Retake (Expired)' : 'Start Test'}
                          </span>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-all" />
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
