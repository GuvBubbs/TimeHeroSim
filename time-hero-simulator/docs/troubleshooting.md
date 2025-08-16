# 🛠️ Troubleshooting Guide

This guide helps you resolve common issues when using the Time Hero Game Balance Simulator.

## 🚨 Common Issues

### Issue: Simulation Won't Start

**Symptoms:**
- Clicking "Start Simulation" has no effect
- No progress bars or visual changes occur
- Console shows errors (open with F12)

**Possible Causes:**
1. **Missing Game Data**: CSV files not loaded properly
2. **Browser Compatibility**: Unsupported browser features
3. **Memory Issues**: Insufficient browser memory
4. **JavaScript Errors**: Code execution failures

**Solutions:**

#### Step 1: Check Game Data Loading
```javascript
// Open browser console (F12) and run:
console.log('Game Values Loaded:', window.gameValuesStore?.isLoaded)
console.log('Validation Errors:', window.gameValuesStore?.validationErrors)
```

If data isn't loaded:
1. Refresh the page (Ctrl+R / Cmd+R)
2. Clear browser cache (Ctrl+Shift+Del / Cmd+Shift+Del)
3. Check network tab for failed CSV requests

#### Step 2: Browser Compatibility Check
**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**
- ES6 Modules
- Web Workers
- LocalStorage
- Modern JavaScript APIs

#### Step 3: Memory Management
1. Close unnecessary browser tabs
2. Restart browser to free memory
3. Use Performance Mode in settings
4. Reduce Monte Carlo run counts

#### Step 4: JavaScript Errors
1. Open browser console (F12)
2. Look for red error messages
3. Take screenshot of errors
4. Report issues via GitHub

---

### Issue: Poor Performance / Slow Simulation

**Symptoms:**
- Simulation runs very slowly
- UI becomes unresponsive
- Browser tab freezes or crashes
- High CPU/memory usage

**Solutions:**

#### Quick Fixes
1. **Enable Performance Mode**
   - Go to Settings → Performance Mode
   - Reduces visual updates during simulation

2. **Reduce Analysis Complexity**
   - Lower Monte Carlo run count (10-50 instead of 100+)
   - Disable real-time chart updates
   - Use faster simulation speeds

3. **Browser Optimization**
   - Close other tabs and applications
   - Use Chrome or Firefox for best performance
   - Disable browser extensions temporarily

#### Advanced Optimization
```javascript
// Configure for maximum performance
simulationConfig = {
  visualUpdates: false,      // Disable real-time charts
  logLevel: 'error',         // Reduce logging
  workerThreads: 2,          // Limit worker threads
  maxMemory: 512             // Set memory limit (MB)
}
```

---

### Issue: Unexpected Simulation Results

**Symptoms:**
- Results don't match expectations
- Progression timing seems wrong
- Resource amounts are unrealistic
- Characters behave oddly

**Debugging Steps:**

#### 1. Verify Player Configuration
```
Check Settings:
- Player Archetype: Speedrunner/Casual/Weekend Warrior
- Check-in Frequency: 0-100%
- Session Length: 0-100%
- Efficiency: 0-100%
- Idle Time Tolerance: 0-100%
```

#### 2. Review Event Log
1. Open Event Log panel
2. Filter by event type
3. Look for unusual patterns
4. Export log for analysis

#### 3. Compare with Baseline
1. Reset to default "Casual Player" profile
2. Run simulation with default settings
3. Compare results with expected progression

#### 4. Check Game Data Integrity
```javascript
// Verify game data in console
console.log('Crops:', window.gameValuesStore?.crops?.length)
console.log('Adventures:', window.gameValuesStore?.adventures?.length)
console.log('Upgrades:', window.gameValuesStore?.upgrades?.length)
```

Expected counts:
- Crops: ~29
- Adventures: ~8
- Upgrades: ~30+

---

### Issue: Analysis Tools Not Working

**Symptoms:**
- Monte Carlo simulations fail to start
- A/B testing shows errors
- Bottleneck analyzer produces no results
- Export functions don't work

**Solutions:**

#### Monte Carlo Issues
1. **Reduce Complexity**
   - Start with 10-20 runs
   - Use lower variance parameters
   - Test with single player archetype

2. **Memory Management**
   - Monitor browser memory usage
   - Close other applications
   - Use smaller confidence intervals

#### A/B Testing Problems
1. **Configuration Validation**
   - Ensure both Test A and Test B are configured
   - Check that changes are meaningful
   - Verify parameter ranges are realistic

2. **Statistical Requirements**
   - Use minimum 30 runs per test
   - Ensure sufficient difference between configurations
   - Check for proper randomization

#### Bottleneck Analyzer Issues
1. **Data Requirements**
   - Complete at least one full simulation
   - Ensure simulation reached multiple phases
   - Check for sufficient event history

2. **Threshold Adjustment**
   - Lower sensitivity thresholds
   - Adjust time range filters
   - Review detection criteria

---

### Issue: Data Export Problems

**Symptoms:**
- Export buttons don't work
- Downloaded files are empty
- Incorrect file formats
- Browser blocks downloads

**Solutions:**

#### Browser Download Settings
1. **Check Download Permissions**
   - Chrome: Settings → Advanced → Downloads
   - Firefox: Options → General → Downloads
   - Safari: Preferences → General → Downloads

2. **Disable Download Blocking**
   - Allow automatic downloads for localhost
   - Whitelist the simulator domain
   - Check popup blocker settings

#### File Format Issues
1. **JSON Export**
   - Large files may timeout
   - Use "Pretty Print" for readability
   - Consider data filtering

2. **CSV Export**
   - Check delimiter settings (comma vs semicolon)
   - Verify encoding (UTF-8)
   - Test with different spreadsheet applications

#### Manual Export Workaround
```javascript
// Copy data to clipboard manually
// Open console and run:
copy(JSON.stringify(simulationResults, null, 2))
```

---

## 🔍 Diagnostic Tools

### Built-in Diagnostics

#### System Information
1. Click "🔍 Run Diagnostics" in error screens
2. Review browser capabilities
3. Check memory usage
4. Validate storage access

#### Performance Monitoring
```javascript
// Monitor performance in console
console.log('Memory:', performance.memory)
console.log('Timing:', performance.now())
console.log('Workers:', typeof Worker !== 'undefined')
```

### Manual Testing

#### Basic Functionality Test
1. Load simulator page
2. Verify game data loads (check for error messages)
3. Start a quick simulation (Speedrunner, 5x speed)
4. Check that progression occurs normally
5. Export results to verify data access

#### Advanced Features Test
1. Open Advanced Analysis panel
2. Run Monte Carlo with 10 simulations
3. Configure simple A/B test
4. Run Bottleneck Analyzer
5. Export all results

---

## 🆘 Getting Help

### Before Reporting Issues

**Gather Information:**
1. Browser type and version
2. Operating system
3. Error messages (screenshots)
4. Steps to reproduce
5. Expected vs actual behavior

**Try Basic Solutions:**
1. Refresh the page
2. Clear browser cache
3. Try different browser
4. Restart computer

### Reporting Bugs

#### GitHub Issues
1. Go to [GitHub Issues](https://github.com/GuvBubbs/TimeHeroSim/issues)
2. Search for existing similar issues
3. Use the bug report template
4. Include diagnostic information

#### Issue Template
```markdown
**Bug Description**
Brief description of the problem

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Browser: Chrome 91
- OS: Windows 10
- Simulator Version: 1.0.0

**Console Errors**
```
Paste any error messages here
```

**Additional Context**
Any other relevant information
```

### Community Support

#### Discussion Forums
- GitHub Discussions for questions
- Community tips and tricks
- Feature requests and suggestions

#### Documentation
- User Guide for detailed instructions
- API Reference for technical details
- Development Plan for roadmap

---

## ⚡ Performance Tips

### Optimal Settings
```javascript
// Recommended configuration for best performance
{
  monteCarloRuns: 50,        // Balance accuracy vs speed
  visualUpdates: false,      // Disable during long runs
  exportFormat: 'json',      // Faster than CSV
  logLevel: 'warn',          // Reduce console spam
  chartAnimations: false     // Disable for speed
}
```

### System Requirements

#### Minimum Requirements
- 4GB RAM
- Modern browser (last 2 versions)
- 100MB free disk space
- Stable internet connection

#### Recommended Requirements
- 8GB+ RAM
- Chrome/Firefox latest version
- 1GB free disk space
- Fast internet connection

### Memory Management
1. **Monitor Usage**: Keep browser memory under 2GB
2. **Clear Cache**: Regular browser cache clearing
3. **Close Tabs**: Minimize other browser tabs
4. **Restart Browser**: After heavy analysis sessions

---

## 📋 Checklist for Issues

### Quick Diagnostics
- [ ] Page loads without errors
- [ ] Game data loads successfully
- [ ] Basic simulation starts and completes
- [ ] Charts and visualizations appear
- [ ] Export functions work
- [ ] Browser console shows no red errors

### Before Reporting Bugs
- [ ] Tried refreshing the page
- [ ] Tested in different browser
- [ ] Cleared browser cache
- [ ] Checked for console errors
- [ ] Gathered system information
- [ ] Searched existing issues

### Performance Optimization
- [ ] Closed unnecessary browser tabs
- [ ] Enabled Performance Mode
- [ ] Reduced analysis complexity
- [ ] Monitored memory usage
- [ ] Updated browser to latest version

---

This troubleshooting guide covers the most common issues. For additional help, check the [User Guide](user-guide.md) or report issues on [GitHub](https://github.com/GuvBubbs/TimeHeroSim/issues).
