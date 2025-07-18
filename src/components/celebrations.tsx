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
  img.src = '/images/nyan-cat.gif';
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
    right: 0px;
    width: 200px;
    height: auto;
    z-index: 9999;
    pointer-events: none;
    animation: raptor-slide 4s ease-in-out forwards;
  `;
  
  // Create image
  const img = document.createElement('img');
  img.src = '/images/raptor.png';
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
          right: 0px;
        }
        15% {
          bottom: 0px;
          right: 0px;
        }
        70%,
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

// Emoji parade utility to create bouncing celebration
export const triggerEmojiParade = () => {
  const emojis = ['🎉', '🌟', '⭐', '🎊', '✨', '🎈', '🌈'];
  
  // Create multiple emoji elements
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const container = document.createElement('div');
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      
      container.style.cssText = `
        position: fixed;
        top: ${20 + Math.random() * 40}%;
        left: -60px;
        font-size: 50px;
        z-index: 9999;
        pointer-events: none;
        animation: emoji-bounce 3s ease-out forwards;
        animation-delay: ${i * 0.1}s;
      `;
      
      container.textContent = randomEmoji;
      
      // Add keyframe animation if not already added
      if (!document.querySelector('#emoji-parade-styles')) {
        const style = document.createElement('style');
        style.id = 'emoji-parade-styles';
        style.textContent = `
          @keyframes emoji-bounce {
            0% {
              left: -60px;
              transform: translateY(0) scale(1);
            }
            25% {
              transform: translateY(-20px) scale(1.2);
            }
            50% {
              transform: translateY(0) scale(1);
            }
            75% {
              transform: translateY(-10px) scale(1.1);
            }
            100% {
              left: calc(100vw + 60px);
              transform: translateY(0) scale(1);
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(container);
      
      // Clean up after animation
      setTimeout(() => {
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }, 3500);
    }, i * 100);
  }
};

// Unicorn utility to create magical flying animation
export const triggerUnicorn = () => {
  // Create container
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 30%;
    left: -250px;
    width: 200px;
    height: auto;
    z-index: 9999;
    pointer-events: none;
    animation: unicorn-fly 3s ease-in-out forwards;
  `;
  
  // Create unicorn (using emoji since no image URL provided)
  const unicorn = document.createElement('div');
  unicorn.style.cssText = `
    font-size: 80px;
    filter: drop-shadow(0 0 20px rgba(255, 192, 203, 0.8));
  `;
  unicorn.textContent = '🦄';
  
  // Create rainbow trail
  const trail = document.createElement('div');
  trail.style.cssText = `
    position: absolute;
    top: 40px;
    left: -50px;
    font-size: 40px;
    animation: rainbow-trail 3s ease-in-out forwards;
  `;
  trail.textContent = '🌈✨🌟';
  
  // Add keyframe animation if not already added
  if (!document.querySelector('#unicorn-styles')) {
    const style = document.createElement('style');
    style.id = 'unicorn-styles';
    style.textContent = `
      @keyframes unicorn-fly {
        0% {
          left: -250px;
          transform: translateY(0) rotate(0deg);
        }
        50% {
          transform: translateY(-30px) rotate(5deg);
        }
        100% {
          left: calc(100vw + 250px);
          transform: translateY(0) rotate(0deg);
        }
      }
      
      @keyframes rainbow-trail {
        0% {
          opacity: 0;
          transform: scale(0.5);
        }
        50% {
          opacity: 1;
          transform: scale(1);
        }
        100% {
          opacity: 0.3;
          transform: scale(0.8);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  container.appendChild(unicorn);
  container.appendChild(trail);
  document.body.appendChild(container);
  
  // Clean up after animation
  setTimeout(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 4000);
};

// Balloons utility to create floating celebration
export const triggerBalloons = () => {
  
  // Create multiple balloons
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      const container = document.createElement('div');
      
      container.style.cssText = `
        position: fixed;
        bottom: -100px;
        left: ${20 + Math.random() * 60}%;
        font-size: 60px;
        z-index: 9999;
        pointer-events: none;
        animation: balloon-float 4s ease-out forwards;
        animation-delay: ${i * 0.2}s;
        filter: hue-rotate(${Math.random() * 360}deg);
      `;
      
      container.textContent = '🎈';
      
      // Add keyframe animation if not already added
      if (!document.querySelector('#balloon-styles')) {
        const style = document.createElement('style');
        style.id = 'balloon-styles';
        style.textContent = `
          @keyframes balloon-float {
            0% {
              bottom: -100px;
              transform: translateX(0) scale(1);
            }
            70% {
              bottom: calc(100vh + 50px);
              transform: translateX(${Math.random() * 100 - 50}px) scale(1.1);
            }
            100% {
              bottom: calc(100vh + 50px);
              transform: translateX(${Math.random() * 100 - 50}px) scale(0.8);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(container);
      
      // Clean up after animation
      setTimeout(() => {
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }, 4500);
    }, i * 150);
  }
};
