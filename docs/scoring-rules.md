# Endless Mode & Limited-Time Mode Scoring Rules

## Overview

The endless mode and limited-time mode use a time-based scoring system that rewards faster responses. Players earn points based on how quickly they submit a correct idiom answer.

## Scoring Table

| Time Cost | Score |
|-----------|-------|
| ≤ 10 seconds | +10 points |
| 10s - 20s | +9 points |
| 20s - 30s | +8 points |
| 30s - 60s | +7 points |
| > 60 seconds | +5 points |
| Give Up | -10 points |

## Rules Explanation

### Correct Answer Scoring

When a player submits a correct idiom, the score is calculated based on the time elapsed since the start of their turn:

- **10 points**: Answer within 10 seconds (fastest response)
- **9 points**: Answer between 10-20 seconds
- **8 points**: Answer between 20-30 seconds
- **7 points**: Answer between 30-60 seconds
- **5 points**: Answer after 60 seconds (slowest response)

### Give Up Penalty

When a player chooses to give up during their turn:
- **-10 points** are deducted from the total score
- The game continues with the computer's turn
- The score can go below zero

## Implementation Details

- Time cost is measured in milliseconds internally
- The timer starts when the computer completes its turn
- The timer stops when the player submits their answer
- Only correct submissions earn points; wrong submissions do not affect the score

## Game Modes

### Endless Mode

- No time limit for the entire game
- Game continues indefinitely until the player decides to stop
- Player can give up on any turn
- Turn time is displayed on the right side of the status bar

### Limited-Time Mode

- Game has a total time limit (configurable before starting)
- Game ends automatically when the time limit is reached
- Player can give up on any turn (same penalty as endless mode)
- **Remaining game time** is displayed in the **middle** of the status bar
- Turn time is displayed on the right side of the status bar
- Game time warning (red color) when remaining time ≤ 30 seconds

## Example Scenarios

### Scenario 1: Fast Response
1. Computer says "一心一意"
2. Player responds "意气风发" in 5 seconds
3. Score: +10 points

### Scenario 2: Medium Response
1. Computer says "风和日丽"
2. Player responds "丽质天成" in 25 seconds
3. Score: +8 points

### Scenario 3: Slow Response
1. Computer says "成竹在胸"
2. Player responds "胸有成竹" in 75 seconds
3. Score: +5 points

### Scenario 4: Give Up
1. Computer says "竹报平安"
2. Player cannot think of a response and gives up
3. Score: -10 points

### Scenario 5: Limited-Time Mode Game End
1. Player starts a 2-minute limited-time game
2. Player scores 50 points in various turns
3. When the 2-minute timer reaches 0, the game ends
4. Final score: 50 points

## Notes

- The scoring system encourages quick thinking while still allowing reasonable time for consideration
- Negative scores are possible if a player gives up multiple times
- The scoring applies to endless mode and limited-time mode; challenge mode uses a fixed +10 points per correct answer
