export interface IPO {
  id: string
  name: string
  company: string
  priceRange: string
  status: 'Upcoming' | 'Listed' | 'Oversubscribed'
  launchDate: string
  closeDate: string
  summary: string
  issueSize: string
}
