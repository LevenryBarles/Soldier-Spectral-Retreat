const joystickZone = document.getElementById('joystick');
let playerX = window.innerWidth / 2;
let playerY = window.innerHeight - player.offsetHeight; // Set player at the bottom
let isHPDecreasing = false;
let speed = 0.2;
const bullets = [];
let enemiesRemoved = 0;
let currentStage = 1;
let enemiesRespawned = 0;
let enemiesPerStage = [20,50, 1];
let playermoving = false;
let bossHP = 100; // Set the initial HP
let playerHP = 30; // Initial player health
const playerHPBar = document.getElementById('player-hp-bar');
const bossBullets = [];
let lastBossBulletTime = 0;





const idleSpriteURL = 'soldiersprite.png';
const runSpriteURL = 'soldiershoot.png';

const downSpriteURL = 'soldiershoot.png';

const upSpriteURL = 'soldiershoot.png';


setPlayerSprite(idleSpriteURL);

player.style.left = `${playerX}px`;
player.style.top = `${playerY}px`;

const manager = nipplejs.create({
  zone: joystickZone,
  color: 'gray',
  multitouch: true,
});

let joystickAngle = 0;
let isJoystickActive = false;

manager.on('move', handleJoystickMove);
manager.on('start', handleJoystickStart);
manager.on('end', handleJoystickEnd);

function handleJoystickMove(event, nipple) {
  const angle = nipple.angle.radian;
  const moveX = Math.cos(angle) * speed;
  const moveY = Math.sin(angle) * speed;
  const invertedMoveY = -moveY;

  playerX += moveX;
  playerY += invertedMoveY;

  playerX = Math.min(Math.max(playerX, 0), window.innerWidth - player.offsetWidth + 1000);
  playerY = Math.min(Math.max(playerY, 0), window.innerHeight - player.offsetHeight);

  updatePlayerPosition();
  if (isJoystickActive) {
    createBullet();
  }
  // Check the direction of movement and set the appropriate sprite
  if (Math.abs(moveY) > Math.abs(moveX)) {
    // Moving vertically more than horizontally
    if (moveY > 0) {
      // Moving down
      setPlayerSprite(upSpriteURL);
    } else {
      // Moving up
      setPlayerSprite(downSpriteURL);
    }
  } else {
    // Moving horizontally more than vertically

    setPlayerSprite(runSpriteURL);
  }

  joystickAngle = angle;
}


function handleJoystickStart() {
  isJoystickActive = true;
  gameLoop();
  setPlayerSprite(runSpriteURL);


 
    canEnemyDamagePlayer = true;

}

function handleJoystickEnd() {
  isJoystickActive = false;
  setPlayerSprite(idleSpriteURL);
}

function setPlayerSprite(spriteURL) {
  player.style.backgroundImage = `url('${spriteURL}')`;
}

function updatePlayerPosition() {
  player.style.left = `${playerX}px`;
  player.style.top = `${playerY}px`;

}


const enemies = [];

function createEnemy(direction) {
  if (enemiesRespawned >= enemiesPerStage[currentStage - 1]) {
    return null;
  }

  if (currentStage <= 2) {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.top = '0';
    const validRange = window.innerWidth - enemy.offsetWidth;
    const randomLeft = Math.random() * validRange;
    const adjustedLeft = Math.min(validRange, Math.max(0, randomLeft));
    enemy.style.left = `${adjustedLeft}px`;
    enemy.direction = direction || 'down';
    document.body.appendChild(enemy);
    enemies.push(enemy);
    enemiesRespawned++;

    function move() {
      moveEnemyTowardsPlayer(enemy, playerX, playerY);
      requestAnimationFrame(move);
    }

    move();

    setTimeout(function () {
      if (Math.random() < 0.1) {
        const newEnemy = createEnemy();
        moveEnemyTowardsPlayer(newEnemy, playerX, playerY);
      }
    }, 5000);

    return enemy;
  } else if (currentStage === 3) {
        // Code for creating a boss enemy during the Boss Fight stage
        const bossEnemy = document.createElement('div');
        bossEnemy.className = 'boss-enemy'; // Add 'boss-enemy' class
        bossEnemy.style.top = '0';
        const validRange = window.innerWidth - bossEnemy.offsetWidth;
        const randomLeft = Math.random() * validRange;
        const adjustedLeft = Math.min(validRange, Math.max(0, randomLeft));
        bossEnemy.style.left = `${adjustedLeft}px`;
        bossEnemy.direction = direction || 'down';
        document.body.appendChild(bossEnemy);
        enemies.push(bossEnemy);
        enemiesRespawned++;

         // Create the HP bar for the boss-enemy
          const hpBar = document.createElement('div');
          hpBar.className = 'hp-bar';
          hpBar.style.height = '10px'; // Adjust the height of the HP bar
          hpBar.style.width = '100%'; // Set the initial width to 100%
          hpBar.style.backgroundColor = 'green'; // Set the color of the HP bar
          bossEnemy.appendChild(hpBar);



        function move() {
          // Boss enemy does not move towards the player
          requestAnimationFrame(move);
               // Fire bullets at a certain rate
                      const fireRate = 1000; // Adjust the fire rate as needed
                      const currentTime = new Date().getTime();

                      if (currentTime - lastBossBulletTime > fireRate) {
                        createBossBullet(bossEnemy);
                        lastBossBulletTime = currentTime;
                      }


        }

        move();

        setTimeout(function () {

          const newBossEnemy = createEnemy();
        }, 5000);

        return bossEnemy;

      } else {
        return null;
      }
    }

function createBossBullet(bossEnemy) {
 if (isGameOverScreenVisible() || isWinScreenVisible()) {
    return; // Stop the game loop if the end screens are visible
  }
  const bossBullet = document.createElement('div');
  bossBullet.className = 'boss-bullet';
  bossBullet.style.left = `${parseFloat(bossEnemy.style.left) + bossEnemy.offsetWidth / 2}px`;
  bossBullet.style.top = `${parseFloat(bossEnemy.style.top) + bossEnemy.offsetHeight}px`;

  document.body.appendChild(bossBullet);
  bossBullets.push(bossBullet);
}

function moveBossBullets() {
  bossBullets.forEach((bossBullet, index) => {
    const bulletY = parseFloat(bossBullet.style.top) || 0;
    const bulletSpeed = 0.5; // Adjust the bullet speed as needed

    bossBullet.style.top = `${bulletY + bulletSpeed}px`;

    // Remove boss bullets that go off-screen
    if (bulletY > window.innerHeight) {
      bossBullets.splice(index, 1);
      document.body.removeChild(bossBullet);
    }
  });
}

function checkPlayerBossBulletCollision() {
  bossBullets.forEach((bossBullet, index) => {
    const bulletRect = bossBullet.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    // Simple AABB collision detection
    if (
      bulletRect.top < playerRect.bottom &&
      bulletRect.bottom > playerRect.top &&
      bulletRect.left < playerRect.right &&
      bulletRect.right > playerRect.left
    ) {
      handlePlayerBossBulletCollision();
      bossBullets.splice(index, 1);
      document.body.removeChild(bossBullet);
    }
  });
}

function handlePlayerBossBulletCollision() {
  // Decrease player's health by 2.5
  playerHP -= 2.5;

  // Update the player's HP bar width based on player's health
  const hpBarWidth = (playerHP / 100) * playerHPBar.parentElement.offsetWidth;
  playerHPBar.style.width = `${hpBarWidth}px`;

  // Check for game over condition
  if (playerHP <= 0) {
  showGameOverScreen();
  }
}









function moveEnemyTowardsPlayer(enemy, playerX, playerY) {
  if (enemy) {
    const enemyX = parseFloat(enemy.style.left) || 0;
    const enemyY = parseFloat(enemy.style.top) || 0;

    if (!enemy.classList.contains('boss-enemy')) {
      // Normal enemy behavior
      const angle = Math.atan2(
        playerY + player.offsetHeight / 2 - (enemyY + enemy.offsetHeight / 2),
        playerX + player.offsetWidth / 2 - (enemyX + enemy.offsetWidth / 2)
      );

      const moveX = Math.cos(angle) * speed *5;
      const moveY = Math.sin(angle) * speed * 5;

      enemy.style.left = `${enemyX + moveX}px`;
      enemy.style.top = `${enemyY + moveY}px`;

      // Check the vertical movement direction and apply the flip class
      if (moveY < 0) {
        enemy.classList.add('flipped-vertical');
      } else {
        enemy.classList.remove('flipped-vertical');
      }
    } // Boss enemy behavior
       const bossSpeed = 2; // You can adjust the speed as needed

       // Check if the boss is moving left or right
       const isMovingLeft = enemy.classList.contains('moving-left');

       // Calculate the movement based on the direction
       const moveX = isMovingLeft ? -bossSpeed : bossSpeed;

       // Update the boss position
       enemy.style.left = `${enemyX + moveX}px`;

       // Toggle the direction based on the screen boundaries
       if (enemyX <= 0) {
         enemy.classList.remove('moving-left');
       } else if (enemyX + enemy.offsetWidth >= window.innerWidth) {
         enemy.classList.add('moving-left');
       }
     }


}





var lastBulletTime = 0; // Variable to track the last time a bullet was created

function createBullet() {
 if (isGameOverScreenVisible() || isWinScreenVisible()) {
    return; // Stop the game loop if the end screens are visible
  }
  const currentTime = new Date().getTime();

  // Check if 100ms have passed since the last bullet creation
  if (currentTime - lastBulletTime < 500) {
    // If not, return and do nothing
    return;
  }

  const bullet = document.createElement('div');
  bullet.className = 'bullet';

  // Set the bullet's initial position to the center of the player's top
  bullet.style.left = `${playerX + 15 + player.offsetWidth / 2}px`;
  bullet.style.top = `${playerY}px`;

  document.body.appendChild(bullet);
  bullets.push(bullet);

  // Update the lastBulletTime with the current time
  lastBulletTime = currentTime;
}

function moveBullets() {
  bullets.forEach((bullet, index) => {
    const bulletY = parseFloat(bullet.style.top) || 0;
    const bulletSpeed = 5; // Adjust the bullet speed as needed

    bullet.style.top = `${bulletY - bulletSpeed}px`;

    // Remove bullets that go off-screen
    if (bulletY < 0) {
      bullets.splice(index, 1);
      document.body.removeChild(bullet);
    }
  });
}

function updateStage() {
  if (enemiesRemoved >= enemiesPerStage[currentStage - 1]) {
enemiesRemoved = 0;
    currentStage++;
    if (currentStage <= enemiesPerStage.length) {
      // Display "Stage Clear" message
      showStageText("Stage Clear", "green", 3000);

      // Move player character to the top
      movePlayerToTop(() => {

        // Callback function to be executed once the player reaches the top
        // After reaching the top, reset player position to center bottom
        playerX = window.innerWidth / 2;
        playerY = window.innerHeight - player.offsetHeight;
        updatePlayerPosition();

        // Proceed to the next stage
        enemiesRespawned = 0; // Reset the counter for the new stage
        document.querySelector('.game-container').style.backgroundImage = `url('stage${currentStage}.png')`;

        // Show a colored text for a few seconds
        const color = currentStage === 2 ? 'red' : 'blue';
        const stageText = currentStage === 2 ? 'Stage Two' : 'Boss Fight';
        showStageText(stageText, color, 3000);
        playermoving = false;
      });
    }

  }
}

function movePlayerToTop(callback) {
  const initialPlayerY = window.innerHeight - player.offsetHeight;
  playerY = initialPlayerY;
 playermoving = true
  // Animate the player movement from bottom to top
  const animationDuration = 3000; // Adjust the duration as needed
  const startTime = performance.now();

  function animate() {
    const currentTime = performance.now();
    const elapsedTime = currentTime - startTime;
    const progress = elapsedTime / animationDuration;

    // Linear interpolation for smooth movement
    playerY = initialPlayerY - progress * initialPlayerY;

    updatePlayerPosition();

    if (progress < 1) {
      // Continue the animation until the duration is complete
      requestAnimationFrame(animate);
    } else {
      // Reset player position once the animation is complete
      playerY = 0;
      updatePlayerPosition();

      // Execute the callback function
      if (typeof callback === 'function') {
        callback();
      }
    }
  }

  animate();
}

function showStageText(text, color, duration) {
  const stageText = document.createElement('div');
  stageText.textContent = text;
  stageText.style.color = color;
  stageText.style.fontSize = "40px";
  stageText.style.position = "absolute";
  stageText.style.top = "50%";
  stageText.style.left = "50%";
  stageText.style.transform = "translate(-50%, -50%)";
  document.body.appendChild(stageText);

  // Remove the text after the specified duration
  setTimeout(() => {
    document.body.removeChild(stageText);
  }, duration);
}

function gameLoop() {
 if (isGameOverScreenVisible() || isWinScreenVisible()) {
    return; // Stop the game loop if the end screens are visible
  }
  if (isJoystickActive) {
    const moveX = Math.cos(joystickAngle) * speed;
    const moveY = Math.sin(joystickAngle) * speed;
    const invertedMoveY = -moveY;

    playerX += moveX;
    playerY += invertedMoveY;

    playerX = Math.min(Math.max(playerX, 0), window.innerWidth - player.offsetWidth);
    playerY = Math.min(Math.max(playerY, 0), window.innerHeight - player.offsetHeight);
  }

if( !playermoving){
     if (Math.random() < 0.001) {
          const enemy = createEnemy();

          function move() {
            moveEnemyTowardsPlayer(enemy, playerX, playerY);
            requestAnimationFrame(move);
          }

          move();

          // Add a delay (e.g., 1000 milliseconds) before creating a new enemy
          setTimeout(function () {
            // Call the code to create a new enemy after the delay
            if (Math.random() < 0.1) {
              const newEnemy = createEnemy();
              moveEnemyTowardsPlayer(newEnemy, playerX, playerY);
            }
          }, 5000);
          }
          }
          checkPlayerBossBulletCollision();
moveBossBullets();

   //  Update the player's HP bar width based on player's health
   const hpBarWidth = (playerHP / 100) * playerHPBar.parentElement.offsetWidth;
  playerHPBar.style.width = `${hpBarWidth}px`;
 updateStage();

checkPlayerEnemyCollision();
  checkBulletEnemyCollision();
   // Move bullets
  moveBullets();
    requestAnimationFrame(gameLoop);
}
function isGameOverScreenVisible() {
  const gameOverScreen = document.getElementById('game-over-screen');
  return gameOverScreen.style.display === 'block';
}

function isWinScreenVisible() {
  const winScreen = document.getElementById('win-screen');
  return winScreen.style.display === 'block';
}

const explosionFrames = [
  'https://raw.githubusercontent.com/Ben00000000/asstes/main/explosion1.png',
  'https://raw.githubusercontent.com/Ben00000000/asstes/main/explosion2.png',
  'https://raw.githubusercontent.com/Ben00000000/asstes/main/explosion3.png',
];
const explosionDuration = 300; // milliseconds for each frame


// Add a function to decrease boss HP on bullet collision
// Function to decrease boss HP on bullet collision
function decreaseBossHP() {
  bossHP -= 10; // Decrease HP by 10 (you can adjust this value)

  // Ensure HP doesn't go below 0
  bossHP = Math.max(0, bossHP);

  const bossElement = document.querySelector('.boss-enemy');
  if (bossElement) {
    // Update the HP bar width based on the boss's current HP
    const hpBar = bossElement.querySelector('.hp-bar');
    if (hpBar) {
      const maxWidth = bossElement.offsetWidth; // Max width of the HP bar
      const newWidth = (bossHP / 100) * maxWidth; // Calculate the new width

      // Set the new width to the HP bar
      hpBar.style.width = `${newWidth}px`;
    }

    // Add classes to indicate damage for styling purposes
    if (bossHP > 0) {
      bossElement.classList.add('boss-enemy-with-hp', 'boss-damaged');
    } else {
      showWinScreen();
      document.body.removeChild(bossElement);
      console.log('Boss defeated!');
    }
  }
}

function showGameOverScreen() {
  const gameOverScreen = document.getElementById('game-over-screen');
  const gameContainer = document.getElementById('game-container');


  gameOverScreen.style.display = 'block';
}

function showWinScreen() {
  const winScreen = document.getElementById('win-screen');
  const gameContainer = document.getElementById('game-container');


  winScreen.style.display = 'block';
}



// Modify the collision detection function to include HP decrease
function checkBulletEnemyCollision() {
  bullets.forEach((bullet, bulletIndex) => {
    const bulletRect = bullet.getBoundingClientRect();

    enemies.forEach((enemy, enemyIndex) => {
      const enemyRect = enemy.getBoundingClientRect();

      // Simple axis-aligned bounding box (AABB) collision detection
      if (
        bulletRect.top < enemyRect.bottom &&
        bulletRect.bottom > enemyRect.top &&
        bulletRect.left < enemyRect.right &&
        bulletRect.right > enemyRect.left
      ) {
        // Play explosion animation
        playExplosionAnimation(enemy);

        // Collision detected
        // Remove the bullet and enemy from the DOM and arrays
        bullets.splice(bulletIndex, 1);
        document.body.removeChild(bullet);



        // Decrease boss HP on bullet collision (if the enemy is a boss)
        if (enemy.classList.contains('boss-enemy')) {
          decreaseBossHP()
        }
        else{
        enemies.splice(enemyIndex, 1);
                document.body.removeChild(enemy);
        }

        // Increment the counter
        enemiesRemoved++;
        console.log(`Enemies Removed: ${enemiesRemoved}`);
      }
    });
  });
}

function playExplosionAnimation(enemy) {
  const explosion = document.createElement('div');
  explosion.className = 'explosion';
  explosion.style.position = 'absolute';
  explosion.style.width = '128px'; // Adjust size as needed
  explosion.style.height = '128px';
  explosion.style.backgroundImage = `url('${explosionFrames[0]}')`;
  explosion.style.backgroundSize = 'cover';
  explosion.style.left = enemy.style.left;
  explosion.style.top = enemy.style.top;

  document.body.appendChild(explosion);

  let frameIndex = 0;
  const frameInterval = setInterval(() => {
    frameIndex++;
    if (frameIndex < explosionFrames.length) {
      explosion.style.backgroundImage = `url('${explosionFrames[frameIndex]}')`;
    } else {
      clearInterval(frameInterval);
      document.body.removeChild(explosion);
    }
  }, explosionDuration / explosionFrames.length);
}

function checkPlayerEnemyCollision() {
  const playerRect = player.getBoundingClientRect();

  enemies.forEach((enemy, enemyIndex) => {
    const enemyRect = enemy.getBoundingClientRect();

    // Simple axis-aligned bounding box (AABB) collision detection
    if (
      playerRect.top < enemyRect.bottom &&
      playerRect.bottom > enemyRect.top &&
      playerRect.left < enemyRect.right &&
      playerRect.right > enemyRect.left
    ) {
      // Collision detected
      // You can implement the logic for what happens when the player collides with an enemy
      handlePlayerEnemyCollision();

 if (enemy.classList.contains('boss-enemy')) {

        }else{
      // Remove the enemy from the DOM and array
      enemies.splice(enemyIndex, 1);
      document.body.removeChild(enemy);
}
      // Update any other variables or game state related to the collision
    }
  });
}

function handlePlayerEnemyCollision() {

 playerHP -= 2.5; // Decrease by 10 (you can adjust this value)

  // Update the player's HP bar
  const hpBarWidth = (playerHP / 100) * playerHPBar.parentElement.offsetWidth;
  playerHPBar.style.width = `${hpBarWidth}px`;


enemiesRemoved++;
  // Check for game over condition
  if (playerHP <= 0) {
   showGameOverScreen();
    console.log('Game Over!');
  }
  // Implement the logic for what happens when the player collides with an enemy
  // For example, you can decrease player health, show a game over message, etc.
  console.log('Player collided with an enemy!');
  console.log(`Enemies Removed: ${enemiesRemoved}`);
  // Add your collision handling logic here
}

function resetGame() {
location.reload();
}


gameLoop();
