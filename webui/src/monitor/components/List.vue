<template>
    <div :style="{'overflow-y': 'scroll','height': height + 'px'}" ref="container" @scroll.prevent="handleScroll">
        <div :style="{'height': contentHeight + 'px'}">
            <div :style="{'transform': 'translate3d(0,'+top + 'px,0)'}">
                <slot :ids="ids"></slot>
            </div>
        </div>
    </div>
</template>
<script>
    import _ from 'lodash';
    const TopPreserve = 20;
    const BottomPreserve = 20;
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
                start: 0 // start index
            };
        },
        computed: {
            ids(){
                let idarray = [];
                for (let i = this.start; i < this.end; i++) {
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
                // 20是头部隐藏的20条记录
                let endIndex = this.start + TopPreserve +this.keeps - 1;
                // 底部多展示20条，防止未渲染区域滚动出现
                endIndex = endIndex + BottomPreserve;
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
            handleScroll: _.throttle(function () {
                let scrollTop = this.$refs.container.scrollTop;
                let itemPass = Math.floor(scrollTop / this.rowHeight);
                if (itemPass < TopPreserve) {
                    this.start = 0;
                } else {
                    // 额外展示20条，防止未渲染区域滚动出现
                    this.start = itemPass - TopPreserve;
                }
            }, 100)
        }
    };

</script>

