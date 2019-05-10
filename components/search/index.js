// components/search/index.js
import {
    KeywordModel
} from '../../models/keyword.js'

import {
    BookModel
} from '../../models/book.js'

import {
    paginationBev
} from '../behaviors/pagination.js'

const keywordModel = new KeywordModel()
const bookModel = new BookModel()

Component({
    behaviors: [
        paginationBev
    ],
    /**
     * 组件的属性列表
     */
    properties: {
        more: {
            type: String,
            observer: 'loadMore'
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        historyWords: [],
        hotWords: [],
        searching: false,
        q: '',
        loadingCenter:false,
    },

    attached() {
        this.setData({
            historyWords: keywordModel.getHistory()
        })

        keywordModel.getHot().then(res => {
            this.setData({
                hotWords: res.hot
            })
        })
    },

    /**
     * 组件的方法列表
     */
    methods: {
        loadMore() {
            if (!this.data.q) {
                return
            }

            if (this.isLocked()) {
                return
            }

            if (this.hasMore()) {
                this.locked()
                bookModel.search(this.getCurrentStart(), this.data.q)
                    .then(res => {
                        this.setMoreData(res.books)
                        this.unLocked()
                    },()=>{
                        this._unLocked()
                    })
            }

        },

        onCancel(event) {
            this.triggerEvent('cancel', {}, {})
            this.initialize()
        },

        onDelete(event) {
            this._closeResult()
            this.initialize()
        },

        onConfirm(event) {
            this._showLoadingCenter()
            this._showResult()

            this.initialize()

            const word = event.detail.value || event.detail.text
            this.setData({
                q: word
            })
            
            bookModel.search(0, word).then(res => {
                this.setMoreData(res.books)
                this.setTotal(res.total)
                keywordModel.addToHistory(word)
                this._hideLoadingCenter()
            })
        },

        _showLoadingCenter(){
            this.setData({
                loadingCenter:true
            })
        },

        _hideLoadingCenter() {
            this.setData({
                loadingCenter: false
            })
        },

        onReachBottom: function() {
            console.log(123123)
        },

        _showResult() {
            this.setData({
                searching: true
            })
        },

        _closeResult(){
            this.setData({
                searching: false,
                q: '',
            })
        }
    }
})