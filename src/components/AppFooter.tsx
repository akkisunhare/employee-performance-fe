export default function AppFooter() {
  return (
    <footer className="w-full bg-black text-white py-4 px-2 text-center">
      <p className="text-sm">
        © {new Date().getFullYear()} Google. All rights reserved.
      </p>
    </footer>
  )
}
