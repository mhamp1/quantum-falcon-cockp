#!/bin/bash

# Add icons to strategies that don't have them
sed -i "s/name: 'EMA Cross Basic',/name: 'EMA Cross Basic',\n    icon: 'TrendUp',/" strategiesData.ts
sed -i "s/name: 'Volume Spike Detector',/name: 'Volume Spike Detector',\n    icon: 'SpeakerHigh',/" strategiesData.ts
sed -i "s/name: 'Support\/Resistance Bounces',/name: 'Support\/Resistance Bounces',\n    icon: 'ArrowsDownUp',/" strategiesData.ts
sed -i "s/name: 'Golden Cross Pro',/name: 'Golden Cross Pro',\n    icon: 'Crosshair',/" strategiesData.ts
sed -i "s/name: 'MACD Divergence Hunter',/name: 'MACD Divergence Hunter',\n    icon: 'ArrowsLeftRight',/" strategiesData.ts
sed -i "s/name: 'Bollinger Band Squeeze',/name: 'Bollinger Band Squeeze',\n    icon: 'Brackets',/" strategiesData.ts
sed -i "s/name: 'Stochastic Crossover',/name: 'Stochastic Crossover',\n    icon: 'Infinity',/" strategiesData.ts
sed -i "s/name: 'Volume Breakout Pro',/name: 'Volume Breakout Pro',\n    icon: 'ArrowUp',/" strategiesData.ts
sed -i "s/name: 'Mean Reversion Classic',/name: 'Mean Reversion Classic',\n    icon: 'ArrowsCounterClockwise',/" strategiesData.ts
sed -i "s/name: 'Triple EMA System',/name: 'Triple EMA System',\n    icon: 'FlowArrow',/" strategiesData.ts
sed -i "s/name: 'Parabolic SAR Trend',/name: 'Parabolic SAR Trend',\n    icon: 'CursorClick',/" strategiesData.ts
sed -i "s/name: 'ADX Trend Strength',/name: 'ADX Trend Strength',\n    icon: 'Gauge',/" strategiesData.ts
sed -i "s/name: 'Keltner Channel Breakout',/name: 'Keltner Channel Breakout',\n    icon: 'Funnel',/" strategiesData.ts
sed -i "s/name: 'Ichimoku Cloud Strategy',/name: 'Ichimoku Cloud Strategy',\n    icon: 'Cloud',/" strategiesData.ts
sed -i "s/name: 'Fibonacci Retracement',/name: 'Fibonacci Retracement',\n    icon: 'Spiral',/" strategiesData.ts
sed -i "s/name: 'ML Price Predictor',/name: 'ML Price Predictor',\n    icon: 'Brain',/" strategiesData.ts
sed -i "s/name: 'Social Sentiment Analyzer',/name: 'Social Sentiment Analyzer',\n    icon: 'ChatCenteredDots',/" strategiesData.ts
sed -i "s/name: 'Order Flow Imbalance',/name: 'Order Flow Imbalance',\n    icon: 'Scales',/" strategiesData.ts
sed -i "s/name: 'Smart Money Divergence',/name: 'Smart Money Divergence',\n    icon: 'Wallet',/" strategiesData.ts
sed -i "s/name: 'Multi-Timeframe Momentum',/name: 'Multi-Timeframe Momentum',\n    icon: 'ClockCounterClockwise',/" strategiesData.ts
sed -i "s/name: 'Volatility Arbitrage',/name: 'Volatility Arbitrage',\n    icon: 'Lightning',/" strategiesData.ts
sed -i "s/name: 'Market Maker Strategy',/name: 'Market Maker Strategy',\n    icon: 'Pulse',/" strategiesData.ts
sed -i "s/name: 'Triangular Arbitrage',/name: 'Triangular Arbitrage',\n    icon: 'Triangle',/" strategiesData.ts
sed -i "s/name: 'Statistical Arbitrage',/name: 'Statistical Arbitrage',\n    icon: 'MathOperations',/" strategiesData.ts
sed -i "s/name: 'Harmonic Pattern Scanner',/name: 'Harmonic Pattern Scanner',\n    icon: 'Waveform',/" strategiesData.ts
sed -i "s/name: 'Elliott Wave Counter',/name: 'Elliott Wave Counter',\n    icon: 'Waveform',/" strategiesData.ts
sed -i "s/name: 'Wyckoff Accumulation',/name: 'Wyckoff Accumulation',\n    icon: 'Package',/" strategiesData.ts
sed -i "s/name: 'VWAP Reversion Pro',/name: 'VWAP Reversion Pro',\n    icon: 'ChartBar',/" strategiesData.ts
sed -i "s/name: 'Options Flow Tracker',/name: 'Options Flow Tracker',\n    icon: 'ArrowsOut',/" strategiesData.ts
sed -i "s/name: 'Gamma Squeeze Detector',/name: 'Gamma Squeeze Detector',\n    icon: 'Lightning',/" strategiesData.ts
sed -i "s/name: 'Cross-Asset Correlation',/name: 'Cross-Asset Correlation',\n    icon: 'Graph',/" strategiesData.ts
sed -i "s/name: 'Supply\/Demand Zones',/name: 'Supply\/Demand Zones',\n    icon: 'ChartLineDown',/" strategiesData.ts
sed -i "s/name: 'Market Profile Analysis',/name: 'Market Profile Analysis',\n    icon: 'ChartPolar',/" strategiesData.ts
sed -i "s/name: 'Order Block Strategy',/name: 'Order Block Strategy',\n    icon: 'Cube',/" strategiesData.ts
sed -i "s/name: 'Exchange Netflow Strategy',/name: 'Exchange Netflow Strategy',\n    icon: 'ArrowsLeftRight',/" strategiesData.ts
sed -i "s/name: 'DeFi Yield Optimizer',/name: 'DeFi Yield Optimizer',\n    icon: 'CoinsSwap',/" strategiesData.ts
sed -i "s/name: 'NFT Floor Sweep Bot',/name: 'NFT Floor Sweep Bot',\n    icon: 'Image',/" strategiesData.ts
sed -i "s/name: 'MEV Protection & Capture',/name: 'MEV Protection & Capture',\n    icon: 'ShieldCheck',/" strategiesData.ts
sed -i "s/name: 'Custom Strategy Builder',/name: 'Custom Strategy Builder',\n    icon: 'PencilLine',/" strategiesData.ts
sed -i "s/name: 'Quantum ML Ensemble',/name: 'Quantum ML Ensemble',\n    icon: 'Atom',/" strategiesData.ts
sed -i "s/name: 'RL Adaptive Trader',/name: 'RL Adaptive Trader',\n    icon: 'Robot',/" strategiesData.ts
sed -i "s/name: 'GPT-4 News Trader',/name: 'GPT-4 News Trader',\n    icon: 'Newspaper',/" strategiesData.ts
sed -i "s/name: 'Multi-Strategy Portfolio',/name: 'Multi-Strategy Portfolio',\n    icon: 'Stack',/" strategiesData.ts
sed -i "s/name: 'White-Label Deployment',/name: 'White-Label Deployment',\n    icon: 'Tag',/" strategiesData.ts
sed -i "s/name: 'API Strategy Publisher',/name: 'API Strategy Publisher',\n    icon: 'Code',/" strategiesData.ts
sed -i "s/name: 'Institutional HFT Engine',/name: 'Institutional HFT Engine',\n    icon: 'Rocket',/" strategiesData.ts
sed -i "s/name: 'Custom AI Model Training',/name: 'Custom AI Model Training',\n    icon: 'GraduationCap',/" strategiesData.ts
sed -i "s/name: 'Unlimited Custom Strategies',/name: 'Unlimited Custom Strategies',\n    icon: 'Infinity',/" strategiesData.ts

echo "Icons added successfully"
