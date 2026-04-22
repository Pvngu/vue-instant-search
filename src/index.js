import './style.css'
import GlobalSearchModal from './components/GlobalSearchModal.vue'

export { GlobalSearchModal }

export default {
    install(app) {
        app.component('GlobalSearchModal', GlobalSearchModal)
    }
}