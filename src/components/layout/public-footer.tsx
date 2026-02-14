export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Domo. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
