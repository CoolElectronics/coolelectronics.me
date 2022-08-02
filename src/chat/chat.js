import '../app.css'
import Chat from './Chat.svelte'

const app = new Chat({
  target: document.getElementById('app')
})

export default app
