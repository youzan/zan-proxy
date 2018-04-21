import createBodyClickListener from './body-click-listener'

// const EVENT_LIST = ['click', 'contextmenu', 'keydown']

export default {
  name: 'context-menu',
  props: {
    id: {
      type: String,
      default: 'default-ctx'
    },
    ctxOpen: {
      type: Function
    },
    ctxCancel: {
      type: Function
    },
    ctxClose: {
      type: Function
    }
  },
  data() {
    return {
      locals: {},
      align: 'left',
      ctxTop: 0,
      ctxLeft: 0,
      ctxVisible: false,
      bodyClickListener: createBodyClickListener(
        (e) => {
          let isOpen = !!this.ctxVisible
          let outsideClick = isOpen && !this.$el.contains(e.target)

          if (outsideClick) {
            if (e.which !== 1) {
              e.preventDefault()
              e.stopPropagation()
              return false;
            } else {

              this.ctxVisible = false
              this.ctxCancel && this.ctxCancel(this.locals);
              e.stopPropagation()
            }
          } else {
            this.ctxVisible = false
            this.ctxClose && this.ctxClose(this.locals);
          }
        }
      )
    }
  },
  methods: {

    setPositionFromEvent(e) {
      const { pageX, pageY } = e
      this.ctxTop = pageY - (document.body.scrollTop)
      this.ctxLeft = pageX
    },

    open(e, data) {
      this.ctxVisible = true
      this.ctxOpen && this.ctxOpen(data);
      this.setPositionFromEvent(e)
      this.$el.setAttribute('tab-index', -1)
      this.bodyClickListener.start()
      return this
    }
  },
  watch: {
    ctxVisible(newVal, oldVal) {
      if (oldVal === true && newVal === false) {
        this.bodyClickListener.stop((e) => {
          // console.log('context menu sequence finished', e)
          // this.locals = {}
        })
      }
    }
  },
  computed: {
    ctxStyle() {
      return {
        'display': this.ctxVisible ? 'block' : 'none',
        'top': (this.ctxTop || 0) + 'px',
        'left': (this.ctxLeft || 0) + 'px'
      }
    }
  }
}
