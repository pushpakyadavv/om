// Solve page functions with Piston API
let currentProblem = null;
let currentProblemId = null;
let solvedProblems = [];
let originalCode = '';

// Piston API Configuration
const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

// Language configuration
const LANGUAGE_CONFIG = {
    javascript: {
        name: 'javascript',
        version: '*',
        extension: 'js',
        filename: 'solution.js'
    },
    python: {
        name: 'python',
        version: '*',
        extension: 'py',
        filename: 'solution.py'
    },
    c: {
        name: 'c',
        version: '*',
        extension: 'c',
        filename: 'solution.c'
    },
    cpp: {
        name: 'cpp',
        version: '*',
        extension: 'cpp',
        filename: 'solution.cpp'
    },
    java: {
        name: 'java',
        version: '*',
        extension: 'java',
        filename: 'Solution.java'
    }
};

// Get code templates
function getInitialCode(language, problem) {
    const templates = {
        javascript: `// ${problem.title}
// Difficulty: ${problem.difficulty}
// Score: ${problem.score}

function solution(${problem.params || 'nums, target'}) {
    // Write your solution here
    // Example for Two Sum:
    // for (let i = 0; i < nums.length; i++) {
    //     for (let j = i + 1; j < nums.length; j++) {
    //         if (nums[i] + nums[j] === target) {
    //             return [i, j];
    //         }
    //     }
    // }
    // return [];
}

// Test your solution
console.log(solution([2, 7, 11, 15], 9));`,

        python: `# ${problem.title}
# Difficulty: ${problem.difficulty}
# Score: ${problem.score}

def solution(${problem.params or 'nums, target'}):
    # Write your solution here
    # Example for Two Sum:
    # for i in range(len(nums)):
    #     for j in range(i + 1, len(nums)):
    #         if nums[i] + nums[j] == target:
    #             return [i, j]
    # return []
    pass

# Test your solution
print(solution([2, 7, 11, 15], 9))`,

        c: `// ${problem.title}
// Difficulty: ${problem.difficulty}
// Score: ${problem.score}

#include <stdio.h>
#include <stdlib.h>

// Write your solution here

int main() {
    // Test your solution
    printf("Hello World\\n");
    return 0;
}`,

        cpp: `// ${problem.title}
// Difficulty: ${problem.difficulty}
// Score: ${problem.score}

#include <iostream>
#include <vector>
using namespace std;

// Write your solution here

int main() {
    // Test your solution
    cout << "Hello World" << endl;
    return 0;
}`,

        java: `// ${problem.title}
// Difficulty: ${problem.difficulty}
// Score: ${problem.score}

import java.util.*;

// Write your solution here

public class Solution {
    public static void main(String[] args) {
        // Test your solution
        System.out.println("Hello World");
    }
}`
    };
    
    return templates[language] || templates.javascript;
}

// Execute code using Piston API
async function executeCodeWithPiston(code, language, stdin = '') {
    try {
        const config = LANGUAGE_CONFIG[language];
        if (!config) {
            throw new Error(`Unsupported language: ${language}`);
        }

        const response = await fetch(PISTON_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language: config.name,
                version: config.version,
                files: [{
                    name: config.filename,
                    content: code
                }],
                stdin: stdin
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        
        return {
            success: true,
            stdout: result.run?.stdout || '',
            stderr: result.run?.stderr || '',
            output: result.run?.output || '',
            code: result.run?.code || 0,
            signal: result.run?.signal || null
        };
    } catch (error) {
        console.error('Piston API error:', error);
        return {
            success: false,
            error: error.message || 'Failed to execute code'
        };
    }
}

// Get test cases for a problem
function getTestCases(problem) {
    // If problem has test_cases in database, use those
    if (problem.test_cases) {
        try {
            return JSON.parse(problem.test_cases);
        } catch {
            // Fall back to default
        }
    }
    
    // Define test cases for each problem
    const testCasesMap = {
        1: [ // Two Sum
            { input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]' },
            { input: 'nums = [3,2,4], target = 6', expected: '[1,2]' },
            { input: 'nums = [3,3], target = 6', expected: '[0,1]' }
        ],
        2: [ // Valid Parentheses
            { input: 's = "()"', expected: 'true' },
            { input: 's = "()[]{}"', expected: 'true' },
            { input: 's = "(]"', expected: 'false' }
        ],
        3: [ // Merge Two Sorted Lists
            { input: 'l1 = [1,2,4], l2 = [1,3,4]', expected: '[1,1,2,3,4,4]' },
            { input: 'l1 = [], l2 = []', expected: '[]' }
        ]
    };
    
    return testCasesMap[problem.id] || [
        { input: 'test input', expected: 'passed' }
    ];
}

// Generate test runner code - FIXED VERSION
function generateTestRunner(language, code, testCases) {
    const runners = {
        javascript: `
${code}

// Test runner
const testCases = ${JSON.stringify(testCases)};

function runTests() {
    let passed = 0;
    let total = testCases.length;
    let results = [];
    
    for (let i = 0; i < testCases.length; i++) {
        const test = testCases[i];
        try {
            // Parse the input string to extract parameters
            // Example: "nums = [2,7,11,15], target = 9" -> { nums: [2,7,11,15], target: 9 }
            const params = {};
            const parts = test.input.split(',').map(p => p.trim());
            for (const part of parts) {
                const [key, value] = part.split('=').map(s => s.trim());
                try {
                    params[key] = JSON.parse(value);
                } catch {
                    // If it's a string, keep it as is
                    params[key] = value.replace(/^["']|["']$/g, '');
                }
            }
            
            // Call solution with the parsed parameters
            const result = solution(...Object.values(params));
            const expected = typeof test.expected === 'string' && test.expected.startsWith('[') 
                ? JSON.parse(test.expected) 
                : test.expected;
            
            const passed_test = JSON.stringify(result) === JSON.stringify(expected);
            if (passed_test) passed++;
            
            results.push({ 
                input: test.input, 
                expected: JSON.stringify(expected), 
                got: JSON.stringify(result), 
                passed: passed_test 
            });
        } catch(e) {
            results.push({ 
                input: test.input, 
                expected: test.expected, 
                got: 'Error: ' + e.message, 
                passed: false 
            });
        }
    }
    
    console.log('📊 Test Results:');
    console.log('Passed: ' + passed + '/' + total);
    console.log('---');
    for (const r of results) {
        console.log((r.passed ? '✅' : '❌') + ' Input: ' + r.input);
        if (!r.passed) {
            console.log('   Expected: ' + r.expected);
            console.log('   Got: ' + r.got);
        }
    }
}

runTests();`,

        python: `
${code}

# Test runner
test_cases = ${JSON.stringify(testCases)}

def run_tests():
    passed = 0
    total = len(test_cases)
    results = []
    
    import json
    
    for test in test_cases:
        try:
            # Parse input string
            params = {}
            parts = test['input'].split(',')
            for part in parts:
                key, value = part.split('=')
                key = key.strip()
                value = value.strip()
                try:
                    params[key] = json.loads(value)
                except:
                    # If it's a string, remove quotes
                    params[key] = value.strip('"\'')
            
            # Call solution
            result = solution(*params.values())
            
            # Parse expected
            expected = test['expected']
            try:
                expected = json.loads(expected)
            except:
                pass
            
            passed_test = result == expected
            if passed_test:
                passed += 1
            results.append({
                'input': test['input'],
                'expected': str(expected),
                'got': str(result),
                'passed': passed_test
            })
        except Exception as e:
            results.append({
                'input': test['input'],
                'expected': test['expected'],
                'got': f'Error: {str(e)}',
                'passed': False
            })
    
    print('📊 Test Results:')
    print(f'Passed: {passed}/{total}')
    print('---')
    for r in results:
        print(f"{'✅' if r['passed'] else '❌'} Input: {r['input']}")
        if not r['passed']:
            print(f"   Expected: {r['expected']}")
            print(f"   Got: {r['got']}")

run_tests()`
    };
    
    return runners[language] || runners.javascript;
}

// Load problem
async function loadProblem(problemId) {
    try {
        const result = await getProblemById(parseInt(problemId));
        if (!result.success) {
            showToast('Error loading problem', 'error');
            setTimeout(() => {
                window.location.href = 'problems.html';
            }, 1500);
            return;
        }
        
        currentProblem = result.data;
        currentProblemId = problemId;
        
        // Check if already solved
        const user = await getCurrentUser();
        if (user) {
            const solved = await getSolvedProblems(user.id);
            if (solved.success) {
                solvedProblems = solved.data.map(s => s.problem_id);
            }
        }
        
        // Update UI
        document.getElementById('problemTitle').textContent = currentProblem.title;
        document.getElementById('problemDifficulty').textContent = currentProblem.difficulty.charAt(0).toUpperCase() + currentProblem.difficulty.slice(1);
        document.getElementById('problemDifficulty').className = `difficulty-badge ${currentProblem.difficulty}`;
        document.getElementById('problemScore').textContent = `+${currentProblem.score || 10}`;
        
        // Description
        document.getElementById('problemDescription').innerHTML = `
            <p>${currentProblem.description || 'No description available.'}</p>
        `;
        
        // Constraints
        const constraintsContainer = document.getElementById('problemConstraints');
        if (currentProblem.constraints) {
            const constraints = currentProblem.constraints.split('\n').filter(c => c.trim());
            constraintsContainer.innerHTML = `
                <h4>Constraints:</h4>
                <ul>
                    ${constraints.map(c => `<li>${c.trim()}</li>`).join('')}
                </ul>
            `;
        } else {
            constraintsContainer.innerHTML = `
                <h4>Constraints:</h4>
                <ul>
                    <li>No specific constraints</li>
                </ul>
            `;
        }
        
        // Examples
        const examplesContainer = document.getElementById('problemExamples');
        if (currentProblem.examples) {
            try {
                const examples = JSON.parse(currentProblem.examples);
                examplesContainer.innerHTML = `
                    <h4>Examples:</h4>
                    ${examples.map(ex => `
                        <div class="example-box">
                            <pre>Input: ${ex.input}\nOutput: ${ex.output}${ex.explanation ? `\nExplanation: ${ex.explanation}` : ''}</pre>
                        </div>
                    `).join('')}
                `;
            } catch {
                examplesContainer.innerHTML = `
                    <h4>Examples:</h4>
                    <div class="example-box">
                        <pre>${currentProblem.examples}</pre>
                    </div>
                `;
            }
        } else {
            examplesContainer.innerHTML = `
                <h4>Examples:</h4>
                <div class="example-box">
                    <pre>No examples available.</pre>
                </div>
            `;
        }
        
        // Set initial code
        const language = document.getElementById('languageSelect').value;
        originalCode = getInitialCode(language, currentProblem);
        document.getElementById('codeEditor').value = originalCode;
        
        // Update solved status
        if (solvedProblems.includes(parseInt(problemId))) {
            const badge = document.getElementById('problemDifficulty');
            badge.textContent = `${currentProblem.difficulty} ✅ Solved`;
            badge.style.borderColor = 'var(--success)';
        }
        
    } catch (error) {
        console.error('Error loading problem:', error);
        showToast('Error loading problem', 'error');
    }
}

// Run code
async function runCode(code, language) {
    const outputContent = document.getElementById('outputContent');
    const runBtn = document.getElementById('runBtn');
    
    runBtn.disabled = true;
    runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
    outputContent.textContent = '⏳ Compiling and running...';
    outputContent.className = 'output-content';
    
    try {
        const result = await executeCodeWithPiston(code, language);
        
        if (result.success) {
            const output = result.stdout || result.output || 'No output';
            const error = result.stderr || '';
            
            if (error) {
                outputContent.textContent = `⚠️ Compilation/Runtime Warning:\n${error}\n\nOutput:\n${output}`;
                outputContent.className = 'output-content';
            } else if (result.code !== 0 && result.code !== undefined) {
                outputContent.textContent = `❌ Process exited with code ${result.code}\n\n${output}`;
                outputContent.className = 'output-content error';
            } else {
                outputContent.textContent = output || '✅ Code executed successfully (no output)';
                outputContent.className = 'output-content success';
            }
        } else {
            outputContent.textContent = `❌ Error: ${result.error}`;
            outputContent.className = 'output-content error';
            showToast('Error executing code', 'error');
        }
    } catch (error) {
        outputContent.textContent = `❌ Error: ${error.message}`;
        outputContent.className = 'output-content error';
        showToast('Error executing code', 'error');
    } finally {
        runBtn.disabled = false;
        runBtn.innerHTML = '<i class="fas fa-play"></i> Run';
    }
}

// Submit solution
async function submitSolution(code, language) {
    const outputContent = document.getElementById('outputContent');
    const submitBtn = document.getElementById('submitBtn');
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    outputContent.textContent = '⏳ Evaluating your solution...';
    outputContent.className = 'output-content';
    
    try {
        const user = await getCurrentUser();
        if (!user) {
            showToast('Please login first', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit';
            return;
        }
        
        if (solvedProblems.includes(parseInt(currentProblemId))) {
            showToast('You have already solved this problem!', 'info');
            outputContent.textContent = '✅ You already solved this problem!';
            outputContent.className = 'output-content success';
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit';
            return;
        }
        
        // Get test cases
        const testCases = getTestCases(currentProblem);
        
        // Generate test runner
        const testRunnerCode = generateTestRunner(language, code, testCases);
        
        // Execute tests
        const result = await executeCodeWithPiston(testRunnerCode, language);
        
        if (!result.success) {
            outputContent.textContent = `❌ Error running tests: ${result.error}`;
            outputContent.className = 'output-content error';
            showToast('Error running tests', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit';
            return;
        }
        
        // Parse test results
        const output = result.stdout || result.output || '';
        const passedMatch = output.match(/Passed:\s*(\d+)\/(\d+)/);
        const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
        const total = passedMatch ? parseInt(passedMatch[2]) : testCases.length;
        
        const allPassed = passed === total && total > 0;
        
        if (allPassed) {
            // Save solved problem
            const solved = await saveSolvedProblem(user.id, parseInt(currentProblemId));
            if (!solved.success) {
                showToast('Error saving progress', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit';
                return;
            }
            
            const scoreEarned = currentProblem.score || 10;
            
            // Update user score
            const profile = await getUserProfile(user.id);
            if (profile.success) {
                const newScore = (profile.data.score || 0) + scoreEarned;
                await updateUserProfile(user.id, { score: newScore });
            }
            
            // Save submission
            await saveSubmission(user.id, parseInt(currentProblemId), language, code, 'accepted', scoreEarned);
            
            outputContent.textContent = `✅ Accepted!\nScore: +${scoreEarned} points\n\n${output}`;
            outputContent.className = 'output-content success';
            
            showToast(`Accepted! +${scoreEarned} points`, 'success');
            solvedProblems.push(parseInt(currentProblemId));
            
            // Update solved status
            const badge = document.getElementById('problemDifficulty');
            badge.textContent = `${currentProblem.difficulty} ✅ Solved`;
            badge.style.borderColor = 'var(--success)';
            
        } else {
            await saveSubmission(user.id, parseInt(currentProblemId), language, code, 'wrong_answer', 0);
            
            outputContent.textContent = `❌ Wrong Answer\n\n${output}`;
            outputContent.className = 'output-content error';
            showToast('Wrong answer, try again!', 'error');
        }
        
    } catch (error) {
        console.error('Submit error:', error);
        outputContent.textContent = `❌ Error: ${error.message}`;
        outputContent.className = 'output-content error';
        showToast('Error submitting solution', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit';
    }
}

// Reset code
function resetCode() {
    if (currentProblem && originalCode) {
        if (confirm('Reset code to original template?')) {
            document.getElementById('codeEditor').value = originalCode;
            showToast('Code reset', 'info');
        }
    }
}

// Language change handler
function onLanguageChange() {
    const language = document.getElementById('languageSelect').value;
    const codeEditor = document.getElementById('codeEditor');
    
    const currentCode = codeEditor.value;
    
    if (currentCode !== originalCode) {
        if (!confirm('Changing language will reset your code. Continue?')) {
            document.getElementById('languageSelect').value = 'javascript';
            return;
        }
    }
    
    if (currentProblem) {
        originalCode = getInitialCode(language, currentProblem);
        codeEditor.value = originalCode;
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const code = document.getElementById('codeEditor').value;
        const language = document.getElementById('languageSelect').value;
        runCode(code, language);
    }
});

// Language change listener - ensure DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', onLanguageChange);
    }
});

// Export functions for global use
window.loadProblem = loadProblem;
window.runCode = runCode;
window.submitSolution = submitSolution;
window.resetCode = resetCode;
window.onLanguageChange = onLanguageChange;