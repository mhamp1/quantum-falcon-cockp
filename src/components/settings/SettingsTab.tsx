import {
  User,
  Trophy,
  CalendarBlank,
  PencilSimple,
  Circle,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

type SubTab = "PROFILE" | "ACHIEVEMENTS" | "BILLING" | "API" | "APP" | "LEGAL";

export default function SettingsTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("PROFILE");

  // User stats
  const userStats = {
    username: "@QUANTUMTRADER",
    level: 15,
    totalTrades: 234,
    winRate: 66.5,
    memberSince: "Jan 2024",
    currentXp: 3450,
    nextLevelXp: 5000,
    xpToNext: 1550,
  };

  const xpPercent = (userStats.currentXp / userStats.nextLevelXp) * 100;

  return (
    <div className="relative min-h-full">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(20, 241, 149, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(20, 241, 149, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            filter: "blur(1px)",
          }}
        />
      </div>

      <div className="relative z-10 space-y-6 pb-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1
            className="text-5xl font-bold uppercase tracking-[0.15em] text-primary"
            style={{
              textShadow: "0 0 10px #14F195, 0 0 20px #14F195",
            }}
          >
            SETTINGS
          </h1>

          {/* Sub-Tab Navigation */}
          <div className="max-w-4xl mx-auto p-3 bg-[#1A1A1A] border-y border-primary/30 flex items-center gap-3">
            {(
              [
                "PROFILE",
                "ACHIEVEMENTS",
                "BILLING",
                "API",
                "APP",
                "LEGAL",
              ] as SubTab[]
            ).map((tab) => {
              const displayName =
                tab === "BILLING"
                  ? "Billing & Subscription"
                  : tab === "API"
                    ? "API Integration"
                    : tab === "APP"
                      ? "App Settings"
                      : tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`px-6 py-2 text-sm font-bold uppercase tracking-wider rounded transition-all ${
                    activeSubTab === tab
                      ? "bg-primary text-black shadow-[0_2px_0_#14F195]"
                      : "bg-transparent border border-primary/30 text-primary hover:border-primary"
                  }`}
                >
                  {displayName}
                </button>
              );
            })}
            <button className="ml-auto p-2 text-primary hover:bg-primary/10 rounded">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="stroke-current"
              >
                <line x1="2" y1="4" x2="14" y2="4" strokeWidth="2" />
                <line x1="2" y1="8" x2="14" y2="8" strokeWidth="2" />
                <line x1="2" y1="12" x2="14" y2="12" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Profile Panel */}
        {activeSubTab === "PROFILE" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div
              className="cyber-card p-8"
              style={{
                clipPath:
                  "polygon(20px 0, 100% 0, calc(100% - 20px) 100%, 0 100%, 0 20px)",
              }}
            >
              <div className="flex items-start gap-8">
                {/* Avatar Section */}
                <div className="space-y-4">
                  <div className="w-32 h-32 rounded-full border-2 border-primary bg-black/50 flex items-center justify-center">
                    <User size={48} className="text-muted-foreground" weight="duotone" />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-32 border-primary text-primary hover:bg-primary/10"
                  >
                    Change Photo
                  </Button>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-6">
                  {/* Username */}
                  <div>
                    <h2 className="text-3xl font-bold uppercase text-primary">
                      {userStats.username}
                    </h2>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-black/30 border border-primary/20 rounded">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Trophy size={16} className="text-secondary" />
                        <span className="text-xs text-muted-foreground uppercase">
                          Level
                        </span>
                      </div>
                      <div className="text-2xl font-bold">{userStats.level}</div>
                    </div>
                    <div className="text-center p-4 bg-black/30 border border-primary/20 rounded">
                      <div className="text-xs text-muted-foreground uppercase mb-2">
                        Total Trades
                      </div>
                      <div className="text-2xl font-bold">
                        {userStats.totalTrades}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-black/30 border border-primary/20 rounded">
                      <div className="text-xs text-muted-foreground uppercase mb-2">
                        Win Rate
                      </div>
                      <div className="text-2xl font-bold text-[#FF00FF]">
                        {userStats.winRate}%
                      </div>
                    </div>
                    <div className="text-center p-4 bg-black/30 border border-primary/20 rounded">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CalendarBlank size={16} className="text-primary" />
                        <span className="text-xs text-muted-foreground uppercase">
                          Member Since
                        </span>
                      </div>
                      <div className="text-2xl font-bold">
                        {userStats.memberSince}
                      </div>
                    </div>
                  </div>

                  {/* XP Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground uppercase">
                        XP Progress
                      </span>
                      <span className="text-xs text-primary">
                        {userStats.currentXp} / {userStats.nextLevelXp} XP
                      </span>
                    </div>
                    <Progress value={xpPercent} className="h-1" />
                    <span className="text-xs text-muted-foreground">
                      {userStats.xpToNext} XP to Level {userStats.level + 1}
                    </span>
                  </div>

                  {/* Edit Button */}
                  <div className="flex justify-end">
                    <Button className="bg-primary hover:bg-primary/80 text-black font-bold px-6">
                      <PencilSimple size={16} className="mr-2" weight="bold" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Other Sub-Tabs (Placeholder) */}
        {activeSubTab !== "PROFILE" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center py-24"
          >
            <p className="text-2xl text-muted-foreground uppercase tracking-wide">
              {activeSubTab} Section
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Coming soon...
            </p>
          </motion.div>
        )}

        {/* Large Empty Space */}
        <div className="h-96" />

        {/* Version Info */}
        <div className="fixed bottom-8 left-56 text-xs text-muted-foreground">
          V0.4.1 / BUILD 1023
        </div>

        {/* Floating Action Button */}
        <motion.button
          className="fixed bottom-8 right-8 w-10 h-10 rounded-full bg-primary/50 flex items-center justify-center"
          style={{
            boxShadow: "0 0 12px #14F195",
          }}
          whileHover={{ scale: 1.1, boxShadow: "0 0 20px #14F195" }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 0 12px #14F195",
              "0 0 20px #14F195",
              "0 0 12px #14F195",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Circle size={8} weight="fill" className="text-primary" />
        </motion.button>
      </div>
    </div>
  );
}
