<template>
  <div class="phase-timeline">
    <div class="chart-header">
      <h4>🏆 Phase Progression Timeline</h4>
      <div class="phase-stats">
        <span class="current-phase">Current: {{ simulation.gameState.currentPhase }}</span>
        <span class="current-day">Day {{ simulation.gameState.day }}</span>
      </div>
    </div>
    
    <div class="timeline-container">
      <div class="timeline">
        <div 
          v-for="(phase, index) in phases" 
          :key="phase.name"
          class="phase-segment"
          :class="{ 
            completed: phase.status === 'completed',
            current: phase.status === 'current',
            upcoming: phase.status === 'upcoming'
          }"
          :style="{ width: phase.width + '%' }"
        >
          <div class="phase-info">
            <div class="phase-name">{{ phase.name }}</div>
            <div class="phase-duration" v-if="phase.duration">
              {{ phase.duration }} days
            </div>
            <div class="phase-target">
              Target: {{ phase.targetDay }} days
            </div>
          </div>
          <div class="phase-progress" :style="{ width: phase.progress + '%' }"></div>
        </div>
      </div>
      
      <div class="milestone-markers">
        <div 
          v-for="milestone in milestones" 
          :key="milestone.name"
          class="milestone"
          :style="{ left: milestone.position + '%' }"
          :class="{ achieved: milestone.achieved }"
        >
          <div class="milestone-icon">{{ milestone.icon }}</div>
          <div class="milestone-name">{{ milestone.name }}</div>
          <div class="milestone-day">Day {{ milestone.day }}</div>
        </div>
      </div>
    </div>

    <div class="phase-details">
      <div v-for="phase in phases" :key="phase.name" class="phase-detail" :class="phase.status">
        <span class="phase-icon">{{ getPhaseIcon(phase.name) }}</span>
        <span class="phase-label">{{ phase.name }}</span>
        <span class="phase-timing">
          {{ phase.status === 'completed' ? `Completed in ${phase.duration} days` :
             phase.status === 'current' ? `In progress (${phase.currentDuration} days)` :
             `Target: ${phase.targetDay} days` }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSimulationStore } from '../stores/simulation.js'

const simulation = useSimulationStore()

const phaseTargets = {
  tutorial: 1,
  early: 5,
  mid: 12,
  late: 20,
  endgame: 28
}

const phases = computed(() => {
  const currentDay = simulation.gameState.day
  const currentPhase = simulation.gameState.currentPhase
  const phaseHistory = simulation.phaseHistory || []
  
  const phaseNames = ['tutorial', 'early', 'mid', 'late', 'endgame']
  const currentIndex = phaseNames.indexOf(currentPhase)
  
  return phaseNames.map((phaseName, index) => {
    const isCompleted = index < currentIndex
    const isCurrent = index === currentIndex
    const targetDay = phaseTargets[phaseName]
    
    let duration = 0
    let currentDuration = 0
    
    // Find actual duration from history
    const phaseEntry = phaseHistory.find(entry => entry.phase === phaseName)
    if (phaseEntry) {
      duration = phaseEntry.duration
    }
    
    if (isCurrent) {
      const phaseStartDay = phaseHistory.reduce((sum, entry, idx) => {
        return idx < index ? sum + entry.duration : sum
      }, 1)
      currentDuration = currentDay - phaseStartDay + 1
    }
    
    // Calculate progress within current phase
    let progress = 0
    if (isCompleted) {
      progress = 100
    } else if (isCurrent) {
      const expectedDuration = index === 0 ? targetDay : targetDay - phaseTargets[phaseNames[index - 1]]
      progress = Math.min(100, (currentDuration / expectedDuration) * 100)
    }
    
    return {
      name: phaseName,
      status: isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming',
      targetDay,
      duration: isCompleted ? duration : 0,
      currentDuration: isCurrent ? currentDuration : 0,
      progress,
      width: 20 // Equal width for now, could be proportional to target duration
    }
  })
})

const milestones = computed(() => {
  const currentDay = simulation.gameState.day
  const helpers = simulation.gameState.discoveredHelpers?.length || 0
  const upgrades = simulation.gameState.purchasedUpgrades?.length || 0
  
  return [
    {
      name: 'First Helper',
      icon: '🧙‍♂️',
      day: 5,
      position: (5 / 28) * 100,
      achieved: helpers > 0
    },
    {
      name: 'First Upgrade',
      icon: '⬆️',
      day: 7,
      position: (7 / 28) * 100,
      achieved: upgrades > 0
    },
    {
      name: 'Mining Unlocked',
      icon: '⛏️',
      day: 10,
      position: (10 / 28) * 100,
      achieved: simulation.gameState.unlockedFeatures?.includes('mining')
    },
    {
      name: 'Automation',
      icon: '🤖',
      day: 15,
      position: (15 / 28) * 100,
      achieved: helpers >= 2
    },
    {
      name: 'Endgame',
      icon: '🏆',
      day: 28,
      position: 100,
      achieved: simulation.gameState.currentPhase === 'endgame'
    }
  ]
})

function getPhaseIcon(phaseName) {
  const icons = {
    tutorial: '📚',
    early: '🌱',
    mid: '🌾',
    late: '⚡',
    endgame: '🏆'
  }
  return icons[phaseName] || '📍'
}
</script>

<style scoped>
.phase-timeline {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #dee2e6;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h4 {
  margin: 0;
  color: #495057;
}

.phase-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.current-phase {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.current-day {
  background: #f8f9fa;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.timeline-container {
  position: relative;
  margin-bottom: 2rem;
}

.timeline {
  display: flex;
  height: 60px;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid #dee2e6;
}

.phase-segment {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.phase-segment:last-child {
  border-right: none;
}

.phase-segment.completed {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.phase-segment.current {
  background: linear-gradient(135deg, #007bff, #17a2b8);
  color: white;
}

.phase-segment.upcoming {
  background: #f8f9fa;
  color: #6c757d;
}

.phase-info {
  position: relative;
  z-index: 2;
}

.phase-name {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: capitalize;
}

.phase-duration, .phase-target {
  font-size: 0.625rem;
  opacity: 0.9;
}

.phase-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.5);
  transition: width 0.3s ease;
}

.milestone-markers {
  position: relative;
  height: 40px;
  margin-top: 1rem;
}

.milestone {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transform: translateX(-50%);
}

.milestone.achieved .milestone-icon {
  background: #28a745;
  color: white;
}

.milestone-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dee2e6;
  color: #6c757d;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.milestone-name {
  font-size: 0.625rem;
  font-weight: 500;
  color: #495057;
}

.milestone-day {
  font-size: 0.5rem;
  color: #6c757d;
}

.phase-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
}

.phase-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.phase-detail.completed {
  background: #d4edda;
  color: #155724;
}

.phase-detail.current {
  background: #cce7ff;
  color: #004085;
}

.phase-detail.upcoming {
  background: #f8f9fa;
  color: #6c757d;
}

.phase-icon {
  font-size: 1rem;
}

.phase-label {
  font-weight: 500;
  text-transform: capitalize;
}

.phase-timing {
  font-size: 0.75rem;
  opacity: 0.8;
}
</style>
