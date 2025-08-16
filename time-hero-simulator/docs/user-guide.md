# 📖 Time Hero Simulator - User Guide

Welcome to the comprehensive user guide for the Time Hero Game Balance Simulator! This guide will walk you through all features and help you get the most out of this powerful analysis tool.

## 🚀 Getting Started

### First Time Setup

1. **Access the Simulator**
   - Local development: `http://localhost:5173` (after running `npm run dev`)
   - Online version: [GitHub Pages URL]

2. **Understanding the Interface**
   - **Control Panel**: Left sidebar with simulation controls
   - **Game Visualizer**: Main area showing game state and charts
   - **Event Log**: Bottom panel with detailed activity history
   - **Advanced Analysis**: Toggle-able advanced features panel

### Your First Simulation

1. **Choose a Player Profile**
   ```
   📊 Speedrunner: Optimal play, minimal idle time
   😊 Casual Player: Moderate efficiency, some idle time  
   📅 Weekend Warrior: Intermittent play, longer sessions
   🎛️ Custom: Configure your own parameters
   ```

2. **Start the Simulation**
   - Click "▶️ Start Simulation"
   - Watch real-time progress in the Game Visualizer
   - Monitor resource flows and phase transitions

3. **Review Results**
   - Check completion time and efficiency metrics
   - Review bottlenecks in the Event Log
   - Export results for further analysis

## 🎛️ Control Panel Features

### Player Behavior Configuration

#### Check-in Frequency (0-100%)
- **High (80-100%)**: Player checks game very frequently
- **Medium (50-79%)**: Regular but not obsessive checking
- **Low (0-49%)**: Casual, infrequent checking
- **Impact**: Affects harvest timing and efficiency

#### Session Length (0-100%)
- **Long (80-100%)**: Extended play sessions
- **Medium (50-79%)**: Moderate session length
- **Short (0-49%)**: Quick check-ins only
- **Impact**: Determines how much gets accomplished per session

#### Player Efficiency (0-100%)
- **Optimal (90-100%)**: Perfect decision making
- **Good (70-89%)**: Generally good choices
- **Average (50-69%)**: Some suboptimal decisions
- **Poor (0-49%)**: Frequently suboptimal play
- **Impact**: Affects all action completion times

#### Idle Time Tolerance (0-100%)
- **Low (0-30%)**: Hates waiting, very active
- **Medium (31-60%)**: Accepts some waiting
- **High (61-100%)**: Patient, doesn't mind idle time
- **Impact**: Influences when player takes breaks

### Simulation Controls

#### Speed Settings
```
🐌 0.5x Speed: Detailed observation mode
⏯️ 1x Speed: Normal real-time progression  
⚡ 2x Speed: Quick analysis mode
🚀 5x Speed: Rapid testing mode
⏩ 10x Speed: Ultra-fast completion
```

#### Simulation Options
- **Auto-pause on bottlenecks**: Stops when issues detected
- **Export events**: Automatically save detailed logs
- **Performance mode**: Reduce visual updates for speed
- **Debug logging**: Additional technical information

## 📊 Game Visualizer

### World Layout
Visual representation of all game locations:
- **🌱 Home/Farm**: Main base with crop plots
- **🏰 Town**: Trading and social activities
- **🗼 Tower**: Progression challenges
- **🏔️ Adventure Zones**: Combat and resource gathering

### Resource Tracking
Real-time monitoring of all resources:
- **⚡ Energy**: Current/max with generation rate
- **💰 Gold**: Total accumulated wealth
- **📦 Materials**: Stone, copper, iron, silver, crystal, mythril, obsidian
- **🌾 Crops**: Currently growing and harvested amounts

### Farm Overview
Detailed plot-by-plot farm status:
```
🟩 Ready to Harvest    🟡 Growing (Stage 1-4)
🟫 Planted (Stage 0)   ⬜ Empty Plot
```

### Progression Indicators
- **Current Phase**: Tutorial → Early → Mid → Late → Endgame
- **Active Helpers**: Automation assistants discovered
- **Upgrade Status**: Infrastructure improvements completed
- **Achievement Progress**: Major milestones reached

## 🔬 Advanced Analysis Tools

### Monte Carlo Simulations

Monte Carlo analysis runs hundreds of simulations to provide statistical confidence in balance decisions.

#### Configuration
1. **Number of Runs**: 10-1000 parallel simulations
2. **Variance Parameters**:
   - **Player Behavior Variance**: How much player patterns vary
   - **Game RNG Variance**: Randomness in game mechanics
3. **Confidence Level**: 90%, 95%, or 99% statistical confidence

#### Results Analysis
- **Distribution Charts**: Visual representation of outcome ranges
- **Confidence Intervals**: Statistical bounds on expected results
- **Outlier Detection**: Identification of unusual simulation runs
- **Stability Metrics**: How consistent the game balance is

#### Best Practices
- Use 100+ runs for reliable statistics
- Set appropriate variance levels (10-20% typical)
- Focus on 95% confidence intervals for balance decisions
- Compare multiple configurations to find optimal balance

### A/B Testing Framework

Compare two different game configurations to validate balance changes.

#### Setting Up Tests
1. **Configuration A**: Baseline/current game values
2. **Configuration B**: Proposed changes
3. **Test Parameters**: Number of runs, player archetypes
4. **Success Metrics**: What constitutes improvement

#### Running Comparisons
```
Step 1: Configure both test variants
Step 2: Run parallel simulations  
Step 3: Statistical analysis (t-tests, effect sizes)
Step 4: Review recommendations
Step 5: Export detailed comparison report
```

#### Interpreting Results
- **Statistical Significance**: p < 0.05 indicates real difference
- **Effect Size**: How meaningful the difference is practically
- **Confidence Intervals**: Range of expected differences
- **Recommendations**: AI-generated suggestions for optimization

#### Common Test Scenarios
- **Energy Balance**: Does energy generation support progression?
- **Phase Timing**: Are phase transitions appropriately paced?
- **Helper Discovery**: Do helpers appear at the right time?
- **Storage Capacity**: Are storage limits appropriately balanced?

### Bottleneck Analyzer

Automatically detect and analyze progression issues in simulations.

#### Automatic Detection
The analyzer scans for:
- **Energy Shortages**: Periods of insufficient energy
- **Storage Overflow**: Wasted resources due to cap limits
- **Phase Delays**: Slower than expected phase transitions
- **Helper Inefficiency**: Poor automation performance
- **Idle Time Issues**: Excessive waiting periods

#### Severity Classification
```
🔴 Critical: Major progression blockers
🟠 High: Significant player frustration
🟡 Medium: Noticeable but manageable issues  
🟢 Low: Minor optimization opportunities
```

#### Fix Recommendations
For each detected bottleneck, the analyzer provides:
- **Root Cause Analysis**: Why the issue occurs
- **Specific Solutions**: Exact parameter changes suggested
- **Impact Assessment**: Expected improvement from fixes
- **Priority Ranking**: Which issues to address first

#### Health Assessment
Overall game balance health scoring:
- **Good**: Few minor issues, smooth progression
- **Fair**: Some issues but generally playable
- **Concerning**: Multiple significant problems
- **Poor**: Major balance issues requiring immediate attention

### Scenario Testing

Automated regression testing for different player types and game configurations.

#### Player Archetype Tests
- **Speedrunner Validation**: Optimal play should complete in expected time
- **Casual Player Experience**: Moderate play should remain engaging
- **Weekend Warrior Journey**: Intermittent play should progress satisfactorily

#### Balance Validation Tests
- **Energy System**: Generation rates support intended gameplay
- **Progression Pacing**: Phase transitions occur at appropriate intervals
- **Helper Automation**: Discovery timing and efficiency levels
- **Resource Economy**: Material flow rates and storage requirements

#### Regression Detection
- **Baseline Comparison**: Compare against known good configurations
- **Tolerance Levels**: Acceptable variance ranges for key metrics
- **Alert Generation**: Automatic flagging of significant deviations
- **Historical Tracking**: Monitor balance changes over time

## 📈 Data Export and Reporting

### Export Formats

#### JSON Export
Complete simulation data with full detail:
```json
{
  "simulationId": "sim_2024_08_16_001",
  "playerProfile": "casual",
  "completionTime": 28.5,
  "phases": [...],
  "resources": {...},
  "events": [...]
}
```

#### CSV Export  
Spreadsheet-compatible format for external analysis:
```csv
Day,Energy,Gold,Materials,Phase,Events
1,50,10,Stone:5,Tutorial,Started farming
2,75,25,Stone:12,Tutorial,First harvest
...
```

#### Markdown Reports
Human-readable analysis summaries:
```markdown
# Simulation Report: Casual Player

## Summary
- Completion Time: 28.5 days
- Efficiency: 76%
- Major Bottlenecks: 2

## Recommendations
1. Increase energy generation by 15%
2. Reduce mid-game transition requirements
```

### Report Components

#### Executive Summary
- High-level metrics and key findings
- Overall balance health assessment
- Priority recommendations

#### Detailed Analysis
- Phase-by-phase progression breakdown
- Resource flow analysis
- Bottleneck identification and solutions

#### Statistical Appendix
- Raw data tables
- Statistical test results
- Confidence intervals and significance levels

## 🛠️ Troubleshooting

### Common Issues

#### Simulation Won't Start
**Symptoms**: No response when clicking "Start Simulation"
**Causes**: 
- Missing game data files
- Browser compatibility issues
- JavaScript errors

**Solutions**:
1. Refresh the page and try again
2. Check browser console for error messages
3. Verify CSV data files are loaded correctly
4. Try a different browser (Chrome, Firefox, Safari supported)

#### Poor Performance
**Symptoms**: Slow simulation speed, UI lag
**Causes**:
- Large number of Monte Carlo runs
- Multiple browser tabs open
- Insufficient system memory

**Solutions**:
1. Reduce Monte Carlo run count
2. Close other browser tabs
3. Use Performance Mode in settings
4. Restart browser to free memory

#### Unexpected Results
**Symptoms**: Simulation results don't match expectations
**Causes**:
- Incorrect player behavior parameters
- Modified game data
- Edge case scenarios

**Solutions**:
1. Reset to default player profiles
2. Verify game data hasn't been modified
3. Check Event Log for unusual patterns
4. Try different player archetypes

#### Export Issues
**Symptoms**: Cannot download or view exported data
**Causes**:
- Browser download restrictions
- Large file sizes
- File format compatibility

**Solutions**:
1. Check browser download permissions
2. Reduce export data size
3. Try different export format
4. Use "Save As" if automatic download fails

### Getting Help

#### Debug Information
When reporting issues, include:
- Browser type and version
- Simulation parameters used
- Error messages from browser console
- Steps to reproduce the problem

#### Support Channels
- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: Comprehensive guides and references
- **Community Forum**: User discussions and tips

## 💡 Best Practices

### Simulation Setup
1. **Start Simple**: Begin with default player profiles
2. **Incremental Changes**: Modify one parameter at a time
3. **Multiple Runs**: Use Monte Carlo for statistical confidence
4. **Document Changes**: Export results for comparison

### Analysis Workflow
1. **Baseline Establishment**: Run default configuration first
2. **Issue Identification**: Use Bottleneck Analyzer
3. **Solution Testing**: Apply A/B testing for proposed fixes
4. **Validation**: Confirm improvements with Monte Carlo
5. **Regression Testing**: Ensure no new issues introduced

### Data Management
1. **Regular Exports**: Save important simulation results
2. **Version Control**: Track game data changes over time
3. **Backup Strategy**: Maintain copies of successful configurations
4. **Documentation**: Record reasoning behind balance decisions

## 🎯 Advanced Tips

### Power User Features
- **Keyboard Shortcuts**: Space for pause/play, R for reset
- **URL Parameters**: Share specific configurations via links
- **Batch Processing**: Queue multiple simulation runs
- **Custom Metrics**: Define your own success criteria

### Performance Optimization
- **Worker Threads**: Utilize background processing for speed
- **Memory Management**: Monitor resource usage during long runs
- **Selective Visualization**: Disable unnecessary charts for speed
- **Strategic Sampling**: Use representative player behavior ranges

### Statistical Confidence
- **Sample Sizes**: Use adequate numbers for reliable statistics
- **Variance Control**: Understand the difference between player and game variance
- **Interpretation**: Focus on effect sizes, not just p-values
- **Multiple Testing**: Adjust significance levels for multiple comparisons

---

This user guide covers the essential features and workflows of the Time Hero Game Balance Simulator. For additional technical details, see the [API Reference](api-reference.md) and [Developer Documentation](../Docs/simulator-development-plan.md).
