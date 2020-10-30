import Link from 'next/link'

const Header = ({ currentUser }) => {
  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign In', href: '/auth/signin' },

    currentUser && { label: 'Sell Ticketd', href: '/tickets/new' },
    currentUser && { label: 'My Orders', href: '/orders' },

    currentUser && { label: 'Sign Out', href: '/auth/signout' },
  ]
    .filter((l) => l)
    .map(({ label, href }) => (
      <Link href={href} key={href}>
        <a className="navbar-brand">{label}</a>
      </Link>
    ))
  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">Tixo</a>
      </Link>

      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">{links}</ul>
      </div>
    </nav>
  )
}
export default Header
