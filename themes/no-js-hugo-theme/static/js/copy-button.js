document.addEventListener('DOMContentLoaded', (event) => {
  // Select all code blocks inside <pre> tags
  document.querySelectorAll('pre code').forEach((block) => {
    // Skip if this code block is inside a line number column (td.lntd)
    if (block.closest('.lntd')) {
      return; // Skip line number columns
    }

    // Check if the block already has a copy button
    if (block.parentNode.querySelector('.copy-button')) {
      return; // Skip if button already exists
    }

    // Create a new copy button
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = 'Copy';

    // Position the button inside the pre tag
    const pre = block.parentNode;
    pre.style.position = 'relative'; // Ensure the button is positioned correctly

    // Add an event listener to the button
    button.addEventListener('click', async () => {
      try {
        // Get the text contents of the code block
        const text = block.textContent;

        // Copy the text to the clipboard
        await navigator.clipboard.writeText(text);

        // Update the button text to indicate that the code has been copied
        button.textContent = 'Copied!';

        // Reset the button text after 2 seconds
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      } catch (error) {
        console.error('Error copying text to clipboard:', error);
      }
    });

    // Insert the button before the code block
    pre.insertBefore(button, block);
  });
});
