import { useState, useEffect } from 'react'
import ServiceCard from '../components/ServiceCard'

function Catalog() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCat, setSelectedCat] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [catsRes, servRes] = await Promise.all([
        fetch('http://localhost:5000/api/categories'),
        fetch('http://localhost:5000/api/services')
      ])
      const cats = await catsRes.json()
      const serv = await servRes.json()
      setCategories(cats)
      setServices(serv)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = selectedCat
    ? services.filter(s => s.category_id === Number(selectedCat))
    : services

  if (loading) return <div className="container">Загрузка...</div>

  return (
    <div className="container">
      <h1>Каталог услуг</h1>

      <div className="filters">
        <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
          <option value="">Все категории</option>
          {categories.map(cat => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="services-grid">
        {filtered.map(service => (
          <ServiceCard key={service.service_id} service={service} />
        ))}
      </div>
    </div>
  )
}

export default Catalog