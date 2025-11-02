import type { Question } from '@/lib/test-types';

/**
 * UI/UX Designer test questions
 * Focus on design thinking, component design, and user experience
 */

export const mockQuestionsUIUX: Question[] = [
  {
    id: 'uiux-1',
    title: 'Design a Responsive Card Component',
    description: `Design a reusable card component that works across mobile, tablet, and desktop devices. 

The component should:
- Display an image, title, description, and action button
- Be responsive and maintain aspect ratio on all screen sizes
- Handle long text gracefully with ellipsis
- Support hover states on desktop
- Be accessible with proper semantic HTML

Explain your design decisions including:
1. CSS approach (Tailwind, CSS Grid, Flexbox)
2. Mobile-first considerations
3. Accessibility features implemented
4. States and variations`,
    difficulty: 'easy' as const,
    examples: [
      {
        input: 'Desktop viewport (1024px width)',
        output: 'Card with full content visible, hover effects active',
        explanation: 'On desktop, all content is visible with interactive hover states',
      },
      {
        input: 'Mobile viewport (375px width)',
        output: 'Card with stacked layout, touch-friendly spacing',
        explanation: 'On mobile, content adapts to smaller screen with adequate spacing for touch targets',
      },
      {
        input: 'Very long title text (150+ characters)',
        output: 'Title truncated with ellipsis, tooltip on hover',
        explanation: 'Long text is handled gracefully without breaking layout',
      },
    ],
    testCases: [
      {
        input: 'Mobile responsive layout',
        expectedOutput: 'flex-col, full-width, touch-target min 44px',
        description: 'Card should stack vertically on mobile with proper spacing',
        isHidden: false,
      },
      {
        input: 'Image aspect ratio',
        expectedOutput: 'maintains 16:9 ratio, no distortion',
        description: 'Images should maintain aspect ratio without stretching',
        isHidden: false,
      },
      {
        input: 'Accessibility compliance',
        expectedOutput: 'semantic HTML, ARIA labels, keyboard navigation',
        description: 'Component should be fully accessible',
        isHidden: true,
      },
    ],
    templateCode: `/* Design a responsive card component
   
   Key considerations:
   - Mobile-first approach
   - Touch-friendly sizing (min 44x44px)
   - Readable hierarchy
   - Accessible markup
   
   Provide HTML/CSS structure:
*/

const cardComponent = {
  // Your component structure here
};`,
    timeLimit: 5 * 60 * 1000, // 5 minutes
  },
  {
    id: 'uiux-2',
    title: 'Color Contrast & Accessibility Audit',
    description: `Review the following color combinations and determine which ones meet WCAG AA standards for accessibility.

WCAG AA requires:
- Normal text: minimum 4.5:1 contrast ratio
- Large text (18pt+): minimum 3:1 contrast ratio
- UI components: minimum 3:1 contrast ratio

Given color pairs in RGB format, calculate contrast ratios and identify compliant combinations.`,
    difficulty: 'medium' as const,
    examples: [
      {
        input: '#000000 (black) on #FFFFFF (white)',
        output: 'Ratio: 21:1 - PASS AA and AAA',
        explanation: 'Maximum contrast - passes all accessibility standards',
      },
      {
        input: '#666666 (dark gray) on #FFFFFF (white)',
        output: 'Ratio: 6.67:1 - PASS AA and AAA',
        explanation: 'Good contrast for normal text',
      },
      {
        input: '#CCCCCC (light gray) on #FFFFFF (white)',
        output: 'Ratio: 1.13:1 - FAIL',
        explanation: 'Poor contrast - fails accessibility standards',
      },
    ],
    testCases: [
      {
        input: 'Color pair: #FF0000, #FFFFFF',
        expectedOutput: 'Ratio >= 4.5 for AA compliance',
        description: 'Red on white should have adequate contrast',
        isHidden: false,
      },
      {
        input: 'Color pair: #0066CC, #FFFFFF',
        expectedOutput: 'Ratio >= 4.5 for AA compliance',
        description: 'Blue on white accessibility check',
        isHidden: false,
      },
      {
        input: 'Font size impact on ratios',
        expectedOutput: 'Large text (18pt+) requires 3:1, normal requires 4.5:1',
        description: 'Different standards for different text sizes',
        isHidden: true,
      },
    ],
    templateCode: `/* Accessibility Audit - Contrast Ratios

   Calculate contrast ratio between two colors
   Formula: (L1 + 0.05) / (L2 + 0.05)
   where L = (0.299*R + 0.587*G + 0.114*B) / 255
   
   Determine WCAG compliance levels:
   - AA: 4.5:1 for normal text, 3:1 for large text
   - AAA: 7:1 for normal text, 4.5:1 for large text
*/

function contrastRatio(color1, color2) {
  // Your implementation here
  return ratio;
}`,
    timeLimit: 8 * 60 * 1000, // 8 minutes
  },
  {
    id: 'uiux-3',
    title: 'Interaction Design - Form State Flows',
    description: `Design the complete interaction flow for a multi-step form including:
- Empty state (all fields blank)
- Validating state (user typing)
- Validation error state (invalid input)
- Loading state (submitting data)
- Success state (form submitted)
- Error state (submission failed with retry)

Document the visual changes, animations, and user feedback for each state transition.

Consider:
1. Visual feedback clarity
2. Accessibility of error messages
3. Loading and processing indicators
4. Error recovery options
5. Micro-interactions that improve UX`,
    difficulty: 'hard' as const,
    examples: [
      {
        input: 'User types invalid email',
        output: 'Red border on field, error message below, save button disabled',
        explanation: 'Clear visual feedback prevents form submission with invalid data',
      },
      {
        input: 'Form is being submitted',
        output: 'Loading spinner, button disabled, "Submitting..." text',
        explanation: 'User understands that form submission is in progress',
      },
      {
        input: 'Submission fails with network error',
        output: 'Error banner at top, retry button enabled, form data preserved',
        explanation: 'User can retry without losing their input',
      },
    ],
    testCases: [
      {
        input: 'State transitions diagram',
        expectedOutput: 'All 6 states connected with proper flow',
        description: 'Complete state machine for form workflow',
        isHidden: false,
      },
      {
        input: 'Error message accessibility',
        expectedOutput: 'aria-live="polite" or "assertive", error IDs linked to inputs',
        description: 'Screen reader users informed of validation errors',
        isHidden: false,
      },
      {
        input: 'Recovery and persistence',
        expectedOutput: 'Form data retained on error, clear retry path',
        description: 'Users should never lose their work',
        isHidden: true,
      },
    ],
    templateCode: `/* Form State Flow Design

   Design the user journey through form states:
   
   States to design:
   1. Empty (initial state)
   2. Validating (user input)
   3. Validation Error
   4. Loading (submitting)
   5. Success
   6. Submission Error
   
   For each state, specify:
   - Visual styling
   - User feedback
   - Possible next states
   - Animation/transitions
*/

const formStates = {
  empty: { /* ... */ },
  validating: { /* ... */ },
  error: { /* ... */ },
  loading: { /* ... */ },
  success: { /* ... */ },
  submissionError: { /* ... */ },
};`,
    timeLimit: 10 * 60 * 1000, // 10 minutes
  },
];
