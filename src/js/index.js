!function() {
	const app = {
		init() {
			this.settings();
			this.addGrid();
			this.keyControls();
			this.menuControls();
		},
		settings () {
			this.app = document.querySelector('.maze');
			this.sizes = this.app.getBoundingClientRect();
			this.width = this.sizes.width;
			this.height = this.sizes.height;
			this.blockSize = 15;
			this.playerSize = this.blockSize * 2;
			this.blockCount = 0;
			this.blockCountLabel = this.app.querySelector('.maze__label--count');
			this.playerColor = 'green';
			this.totalBlocks = (this.width * this.height) / (this.blockSize * this.blockSize);
			this.grid = this.app.querySelector('.maze-grid');
			this.path = this.app.querySelector('.maze-path');
			this.area = this.app.querySelector('.maze-player');
			this.walls = this.app.querySelector('.maze-wall');
			this.waypoints = this.app.querySelector('.maze-point');
			this.selector = this.app.querySelector('.maze-selector');
		},
		addGrid() {
			for(let i=0;i<this.totalBlocks;i++) {
				const cell = this.createElement('div', ['maze-cell']);
				this.grid.appendChild(cell);
			}
			let limit = true;
			let initialTop = 10.5 * this.playerSize;
			let initialLeft = 0;
			let counter = 0;
			while(limit) {
				counter++;
				const block = this.createElement('div', ['maze-point__point', 'maze-point__point--small', 'maze-blocker']);
				this.walls.appendChild(block);
				block.style.top = initialTop + 'px';
				block.style.left = initialLeft + 'px';
				if((initialTop + this.blockSize) >= this.height) {
					limit = false;
				}
				if(counter > 100) {
					//failsafe while exit
					limit = false;
				}
				initialTop += this.blockSize;
				initialLeft += this.blockSize;
			}
		},
		menuControls() {
			const buttons = this.app.querySelectorAll('.maze-button');
			for(let i=0;i<buttons.length;i++) {
				const btn = buttons[i];
				btn.addEventListener('click', this.buttonEvent.bind(this));
			}
		},
		keyControls() {
			window.addEventListener('keydown', this.moveSelector.bind(this));
			window.addEventListener('keyup', this.moveSelector.bind(this));
		},
		createElement(el, classList) {
			const element = document.createElement(el);
			for(let i=0;i<classList.length;i++) {
				const value = classList[i];
				element.classList.add(value);
			}
			return element;
		},
		buttonEvent(e) {
			const target = e.target;
			const value = target.getAttribute('data-value');
			const colorLabel = this.app.querySelector('.maze__label--color');
			const colorClass = "background--" + value;
			if(value === 'reset') {
				this.reset();
			} else {
				colorLabel.textContent = value;
				colorLabel.className = "";
				colorLabel.classList.add('maze__label');
				colorLabel.classList.add('maze__label--color');
				colorLabel.classList.add(colorClass);
				this.playerColor = value;
			}
		},
		checkCollision(left,top, keyCode) {
			//Checks collision with the grid container so the block doesn't move off screen.
			const containerPosition = this.grid.getBoundingClientRect();
			const containerWidth = containerPosition.width;
			const containerHeight = containerPosition.height;
			if(keyCode === 37 && left === 0) {
				return false;
			} else if(keyCode === 38 && top === 0) {
				return false;
			} else if(keyCode === 39 && left === (containerWidth - 30)) {
				return false;
			} else if(keyCode === 40 && top === (containerHeight - 30)) {
				return false;
			}
			return true;
		},
		checkOverlap(left,top) {
			//Check if a place block will overlap with an already placed block or maze point block
			const allBlocks = this.area.querySelectorAll('.maze-block');
			const wayPoints = this.app.querySelectorAll('.maze-blocker');
			const currentRight = left + this.playerSize;
			const currentBottom = top + this.playerSize;

			for (let i = 0; i < wayPoints.length; i++) {
				const block = wayPoints[i];
				const blockSize = block.getBoundingClientRect();

				const blockWidth = blockSize.width;
				const blockHeight = blockSize.height;
				const blockLeft = parseInt(window.getComputedStyle(block).getPropertyValue('left'));
				const blockTop = parseInt(window.getComputedStyle(block).getPropertyValue('top'));
				const blockRight = blockLeft + blockWidth;
				const blockBottom = blockTop + blockHeight;
				const overlap = !(blockRight <= left ||
					blockLeft >= currentRight ||
					blockBottom <= top ||
					blockTop >= currentBottom)
				if (overlap) {
					return true;
					break;
				}
			}
			for(let i=0;i<allBlocks.length;i++) {
				const block = allBlocks[i];

				const blockLeft = parseInt(block.style.left);
				const blockTop = parseInt(block.style.top);
				const blockRight = blockLeft + this.playerSize;
				const blockBottom = blockTop + this.playerSize;
				//Check for full overlap and delete existing block
				if(blockLeft === left && blockTop === top) {
					block.remove();
					this.blockCount--;
					this.updateBlockCount();
					return true;
					break;
				}
				//Check for partial overlap
				const overlap = !(blockRight <= left ||
					blockLeft >= currentRight ||
					blockBottom <= top ||
					blockTop >= currentBottom)
				if(overlap) {
					return true;
					break;
				}
			}
			return false;
		},
		createBlock(left,top) {
			const block = this.createElement('div', ['maze-block']);
			const x = left + 'px';
			const y = top + 'px';
			const overlapping = this.checkOverlap(left, top);
			if(!overlapping) {
				const colorClass = 'background--' + this.playerColor;
				block.classList.add(colorClass);
				this.area.appendChild(block);
				this.blockCount++;
				this.updateBlockCount();
				block.style.left = x;
				block.style.top = y;
			}
		},
		moveSelector(e) {
			const styles = window.getComputedStyle(this.selector);
			const top = parseInt(styles.getPropertyValue('top'));
			const left = parseInt(styles.getPropertyValue('left'));
			const keyCode = e.keyCode;
			const canMove = this.checkCollision(left, top, keyCode);
			const eventType = e.type;
			if(canMove) {
				switch(e.keyCode) {
					// left = 37
					case 37:
						e.preventDefault();
						if(eventType === 'keydown') {
							const value = left - 15 + 'px';
							this.selector.style.left = value;
						}
						break;
	
					// up = 38
					case 38:
						e.preventDefault();
						if(eventType === 'keydown') {
							const value = top - 15 + 'px';
							this.selector.style.top = value;
						}
						break;
	
					// right = 39
					case 39:
						e.preventDefault();
						if(eventType === 'keydown') {
							const value = left + 15 + 'px';
							this.selector.style.left = value;
						}
						break;
	
					// down = 40
					case 40:
						e.preventDefault();
						if (eventType === 'keydown') {
							const value = top + 15 + 'px';
							this.selector.style.top = value;
						}
						break;
	
					// space = 32
					case 32:
						e.preventDefault();
						if(e.type === 'keyup') {
							this.createBlock(left, top)
						}
						break;
	
					default:
						break;
				}
			}
		},
		updateBlockCount() {
			this.blockCountLabel.textContent = this.blockCount;
		},
		reset() {
			const blocks = this.area.querySelectorAll('.maze-block');
			for(let i=0;i<blocks.length;i++) {
				const block = blocks[i];
				block.remove();
			}
			this.blockCount = 0;
			this.updateBlockCount();
		}
	}
	app.init();
}();