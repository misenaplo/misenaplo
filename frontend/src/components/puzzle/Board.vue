<template>
  <div class="board">
    <div class="frame-wrapper" :style="frameSize">
      <div class="original"
          v-if="showingOriginal && image"
          :style="{ background: `url(${image})`}">
      </div>
      <div class="frame" :style="frameSize" v-if="!showingOriginal">
        <Tile v-for="tile in tiles"
          :key="tile.position"
          :tile="tile"
          @moving="moveTile"
          ref="tiles"
        />
      </div>
    </div>
  </div>
</template>

<script>
import sample from 'lodash.sample'
import Tile from './Tile'

let backupTiles = null

export default {
  components: { Tile },

  data () {
    return {
      image: null,
      showingOriginal: false,
      size: {
        horizontal: 0,
        vertical: 0
      },
      tiles: [],
      tileSize: {
        width: 0,
        height: 0
      },
      window: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  },

  computed: {
    frameSize () {
      return {
        width: `${this.tileSize.width * this.size.horizontal}px`,
        height: `${this.tileSize.height * this.size.vertical}px`
      }
    },

    /**
     * The total number of tiles in the current board.
     * @return {Number}
     */
    totalTiles () {
      return this.size.horizontal * this.size.vertical
    },

    /**
     * Determine if the current board is valid (solved).
     * @return {boolean}
     */
    valid () {
      if (!this.tiles.length) {
        return false
      }

      for (let i = 0; i < this.totalTiles; ++i) {
        if (this.tiles[i].styles.order !== this.tiles[i].position) {
          return false
        }
      }

      return true
    }
  },

  methods: {
    onResize() {
      //this.window.height = window.innerHeight
      //this.window.width = window.innerWidth
    },
    start ({ image, size }) {
      this.size = size
      this.image = image
      // detect the width and height of the frame
      const img = new Image()
      img.onload = () => {
        let imW = img.width
        let imH = img.height
        if(imW>this.window.width-70) {
          imW = this.window.width-70
          imH = img.height * (imW / img.width)
        }
        if(imH>this.window.height-120) {
          imH = this.window.height-120
          imW = img.width * (imH / img.height)
        }
        this.tileSize.width = Math.floor(imW / size.horizontal)
        this.tileSize.height = Math.floor(imH / size.vertical)
        this.generateTiles()
        this.shuffleTiles()
      }
      img.src = image
    },

    /**
     * Generate the tiles for the current game.
     */
    generateTiles () {
      this.tiles = []
      for (let i = 0; i < this.totalTiles; ++i) {
        this.tiles.push({
          styles: {
            background: i === 0 ? 'transparent' : `url(${this.image})`,
            backgroundPositionX: `-${(i % this.size.horizontal) * this.tileSize.width}px`,
            backgroundPositionY: `-${Math.floor(i / this.size.horizontal) * this.tileSize.height}px`,
            width: `${this.tileSize.width}px`,
            height: `${this.tileSize.height}px`,
            order: i
          },
          position: i,
          isEmpty: i === 0
        })
      }
    },

    /**
     * Shuffle the generated tiles.
     */
    shuffleTiles () {
      // To make sure the puzzle is solvable, we execute a series of random moves
      for (let i = 0, j = this.totalTiles * 5; i < j; ++i) {
        const emptyTile = this.tiles.find(t => t.isEmpty)
        const movableTiles = this.tiles.filter(t => {
          return this.getAdjacentOrders(emptyTile).indexOf(t.styles.order) > -1
        })
        this.switchTiles(emptyTile, sample(movableTiles))
      }

      // Make a backup for later reset
      backupTiles = JSON.stringify(this.tiles)
    },

    /**
     * Move a (movable) tile
     * @param  {Object} tile
     */
    moveTile (tile) {
      if (tile.isEmpty) {
        return
      }

      if (this.valid) {
        this.showingOriginal=true
        this.$emit('finish')
        return
      }

      // Find the 4 direct (non-diagonal) adjacent tiles and see if any of them is the empty tile
      const target = this.tiles.find(t => {
        return t.isEmpty && this.getAdjacentOrders(tile).indexOf(t.styles.order) > -1
      })

      // If found the empty tile, just switch the flex order and we're good.
      target && this.switchTiles(target, tile)
      this.$emit('moving')
      if (this.valid) {
        this.showingOriginal=true
        this.$emit('finish')
      }
    },

    /**
     * Switch two tiles.
     * @param  {Object} a First tile
     * @param  {Object} b Second tile
     */
    switchTiles (a, b) {
      [a.styles.order, b.styles.order] = [b.styles.order, a.styles.order]
    },

    /**
     * Get the four direct (non-diagonal) adjacent tiles' orders of a tile.
     * @param  {Object} tile
     * @return {Array.<Number>}
     */
    getAdjacentOrders (tile) {
      const pos = tile.styles.order
      return [
        pos % this.size.horizontal ? pos - 1 : null,
        (pos + 1) % this.size.horizontal ? pos + 1 : null,
        pos - this.size.horizontal,
        pos + this.size.horizontal
      ]
    }
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
}
</script>

<style lang="scss">
.frame-wrapper {
  margin: 0 auto;
  position: relative;
  box-shadow: 0 0 0px 10px;

  .original {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
  }

  p.win {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, .5);
    color: #fff;
    font-size: 40px;
    margin: 0 0;
    background: rgba(43, 181, 82, 0.7);
    text-transform: uppercase;
  }
}

.frame {
  display: flex;
  flex-wrap: wrap;
  background: #612211 url('../../assets/board.jpg');
  background-size: cover;
}

.controls {
  margin-top: 30px;

  a {
    display: inline-block;
    text-decoration: none;
    padding: 6px 12px;
    background: #f78403;
    color: #fff;
    border-radius: 3px;

    &.toggle-original {
      background: #d05b88;
    }

    &.restart {
      background: #368ba0;
    }

    &.shuffle {
      background: #3ebb5c;
    }
  }
}
</style>
