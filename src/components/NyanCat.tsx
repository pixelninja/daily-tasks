// NyanCat utility to create flying animation
export const triggerNyanCat = () => {
  // Create container
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 20%;
    left: -800px;
    width: 600px;
    height: auto;
    z-index: 9999;
    pointer-events: none;
    animation: nyan-fly 3s linear forwards;
  `;
  
  // Create image
  const img = document.createElement('img');
  img.src = 'https://gist.githubusercontent.com/brudnak/aba00c9a1c92d226f68e8ad8ba1e0a40/raw/e1e4a92f6072d15014f19aa8903d24a1ac0c41a4/nyan-cat.gif';
  img.alt = 'Nyan Cat';
  img.style.cssText = `
    width: 100%;
    height: auto;
    image-rendering: pixelated;
    filter: drop-shadow(0 0 10px rgba(255, 107, 107, 0.5));
  `;
  
  // Add keyframe animation if not already added
  if (!document.querySelector('#nyan-cat-styles')) {
    const style = document.createElement('style');
    style.id = 'nyan-cat-styles';
    style.textContent = `
      @keyframes nyan-fly {
        0% {
          left: -800px;
        }
        100% {
          left: calc(100vw + 800px);
        }
      }
      
      @media (max-width: 768px) {
        .nyan-cat-container {
          width: 400px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  container.appendChild(img);
  document.body.appendChild(container);
  
  // Clean up after animation
  setTimeout(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 3000);
};

// Raptor utility to create slide animation
export const triggerRaptor = () => {
  // Create container
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    bottom: -300px;
    right: 20px;
    width: 200px;
    height: auto;
    z-index: 9999;
    pointer-events: none;
    animation: raptor-slide 4s ease-in-out forwards;
  `;
  
  // Create image
  const img = document.createElement('img');
  img.src = 'https://zurb.com/playground/uploads/upload/upload/224/raptor.png';
  img.alt = 'Raptor';
  img.style.cssText = `
    width: 100%;
    height: auto;
    image-rendering: pixelated;
    filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.3));
  `;
  
  // Add keyframe animation if not already added
  if (!document.querySelector('#raptor-styles')) {
    const style = document.createElement('style');
    style.id = 'raptor-styles';
    style.textContent = `
      @keyframes raptor-slide {
        0% {
          bottom: -300px;
        }
        25% {
          bottom: 0px;
        }
        75% {
          bottom: 0px;
          right: 20px;
        }
        100% {
          bottom: 0px;
          right: calc(100vw + 200px);
        }
      }
      
      @media (max-width: 768px) {
        .raptor-container {
          width: 150px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  container.appendChild(img);
  document.body.appendChild(container);
  
  // Clean up after animation
  setTimeout(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 4000);
};