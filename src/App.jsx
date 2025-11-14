import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100 via-white to-white" />
      <div className="relative max-w-7xl mx-auto px-6 py-24 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
          SK Furniture Home Decoration
        </span>
        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
          Elevate your home with timeless furniture
        </h1>
        <p className="mt-4 max-w-2xl text-gray-600">
          Handpicked sofas, tables, chairs, and decor crafted for comfort and style. Discover pieces that make your space feel like home.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <a href="#catalog" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition shadow">
            Shop Collection
          </a>
          <a href="#contact" className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
            Get a Quote
          </a>
        </div>
      </div>
    </section>
  )
}

function ProductCard({ p, onInquire }) {
  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
      {p.image_url && (
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
          {p.featured && <span className="inline-flex px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-700">Featured</span>}
        </div>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{p.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-amber-700 font-semibold">${Number(p.price).toFixed(2)}</span>
          <button onClick={() => onInquire(p)} className="text-sm text-amber-700 hover:text-amber-800 font-medium">Inquire</button>
        </div>
      </div>
    </div>
  )
}

function Catalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/api/products?limit=24`)
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch (e) {
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleInquire = (p) => {
    const event = new CustomEvent('open-inquiry', { detail: { product: p } })
    window.dispatchEvent(event)
  }

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Collection</h2>
          <p className="mt-1 text-gray-600">Explore best-selling pieces for living, dining, and more.</p>
        </div>
      </div>

      {loading && <p className="mt-8 text-gray-500">Loading products...</p>}
      {error && <p className="mt-8 text-red-600">{error}</p>}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id || p.title} p={p} onInquire={handleInquire} />
        ))}
        {!loading && products.length === 0 && (
          <div className="col-span-full text-gray-500">
            No products yet. Add some via the backend endpoint to see them here.
          </div>
        )}
      </div>
    </section>
  )
}

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [note, setNote] = useState('')

  useEffect(() => {
    const onOpen = (e) => {
      const { product } = e.detail || {}
      if (product) {
        setForm((f) => ({ ...f, message: `I would like to know more about: ${product.title}` }))
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })
      }
    }
    window.addEventListener('open-inquiry', onOpen)
    return () => window.removeEventListener('open-inquiry', onOpen)
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setNote('')
    try {
      const res = await fetch(`${API_BASE}/api/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('success')
      setForm({ name: '', email: '', phone: '', message: '' })
      setNote('Thanks! We will reach out shortly.')
    } catch (e) {
      setStatus('error')
      setNote('Something went wrong. Please try again.')
    }
  }

  return (
    <section id="contact" className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Request a Quote</h2>
      <p className="mt-1 text-gray-600">Tell us what you need and we’ll help you furnish beautifully.</p>

      <form onSubmit={submit} className="mt-8 grid grid-cols-1 gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input className="w-full rounded-lg border-gray-300 focus:ring-amber-500 focus:border-amber-500" placeholder="Your name" required value={form.name} onChange={(e)=>setForm({ ...form, name:e.target.value })} />
          <input type="email" className="w-full rounded-lg border-gray-300 focus:ring-amber-500 focus:border-amber-500" placeholder="Email address" required value={form.email} onChange={(e)=>setForm({ ...form, email:e.target.value })} />
        </div>
        <input className="w-full rounded-lg border-gray-300 focus:ring-amber-500 focus:border-amber-500" placeholder="Phone (optional)" value={form.phone} onChange={(e)=>setForm({ ...form, phone:e.target.value })} />
        <textarea rows="4" className="w-full rounded-lg border-gray-300 focus:ring-amber-500 focus:border-amber-500" placeholder="How can we help?" required value={form.message} onChange={(e)=>setForm({ ...form, message:e.target.value })} />
        <button disabled={status==='loading'} className="mt-2 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition shadow disabled:opacity-50">
          {status==='loading' ? 'Sending...' : 'Send Request'}
        </button>
        {note && <p className={`text-sm ${status==='success' ? 'text-green-600' : status==='error' ? 'text-red-600' : 'text-gray-500'}`}>{note}</p>}
      </form>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} SK Furniture Home Decoration. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#catalog" className="hover:text-gray-900">Shop</a>
          <a href="#contact" className="hover:text-gray-900">Contact</a>
        </div>
      </div>
    </footer>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-extrabold text-gray-900">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded bg-amber-600 text-white">SK</span>
          <span>Furniture Home Decoration</span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-700">
          <a href="#catalog" className="hover:text-gray-900">Shop</a>
          <a href="#contact" className="hover:text-gray-900">Contact</a>
        </nav>
        <button className="md:hidden text-gray-700" onClick={()=>setOpen(!open)}>Menu</button>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-100 px-6 py-3 flex flex-col gap-2 text-gray-700">
          <a href="#catalog" className="py-1">Shop</a>
          <a href="#contact" className="py-1">Contact</a>
        </div>
      )}
    </header>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <Hero />
      <Catalog />
      <Contact />
      <Footer />
    </div>
  )
}
