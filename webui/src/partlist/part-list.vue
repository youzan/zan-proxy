<template>
  <div :style="{'overflow-y': 'auto','height': height + 'px'}" ref="container" @scroll="handleScroll">
    <div :style="{'height': contentHeight + 'px'}">
      <div :style="{'transform': 'translate3d(0,'+top + 'px,0)'}">
        <slot :ids="ids"></slot>
      </div>
    </div>
  </div>
</template>
<script>
  export default  {
    props: {
      total: {
        type: Number,
        required: true
      },
      height: {
        type: Number,
        required: true
      },
      rowHeight: {
        type: Number,
        required: true
      }
    },
    data(){
      return {
        scrollTop: 0,
        start: 0, // start index
      }
    },
    computed: {
      ids(){
        var idarray = [];
        for (var i = this.start; i < this.end; i++) {
          idarray.push(i);
        }
        return idarray;
      },
      contentHeight(){
        return this.rowHeight * this.total;
      },
      keeps(){
        return Math.ceil(this.height / this.rowHeight) + 2;
      },
      end(){
        var endIndex = this.start + this.keeps - 1;
        if (endIndex > this.total) {
          return this.total;
        } else {
          return endIndex;
        }
      },
      top(){
        return this.rowHeight * this.start;
      }
    },
    methods: {
      handleScroll: _.debounce(function () {
        this.scrollTop = this.$refs.container.scrollTop;
        var itemPass = Math.floor(this.scrollTop / this.rowHeight);
        this.start = itemPass;
      }, 100)
    }
  }

</script>

