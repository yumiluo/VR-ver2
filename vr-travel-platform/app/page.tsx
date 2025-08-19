import { Globe, Users } from "lucide-react" // Import the Globe and Users components
import { Button } from "@/components/ui/button" // Import the Button component
import Link from "next/link" // Import the Link component
import { LanguageSelector } from "@/components/language-selector"
import { useI18n } from "@/lib/i18n"

export default function HomePage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-sidebar/95 backdrop-blur-sm border-b border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Globe className="h-8 w-8 text-primary" />
              <span className="font-sans font-bold text-xl text-sidebar-foreground">{t("app.title")}</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Button variant="ghost" className="text-sidebar-foreground hover:text-sidebar-primary">
                {t("nav.howItWorks")}
              </Button>
              <Button variant="ghost" className="text-sidebar-foreground hover:text-sidebar-primary">
                {t("nav.destinations")}
              </Button>
              <Link href="/rooms">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {t("nav.browseRooms")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="font-sans text-4xl lg:text-6xl font-bold text-sidebar-foreground mb-6">{t("hero.title")}</h1>
            <p className="font-serif text-xl text-muted-foreground mb-8 leading-relaxed">{t("hero.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/rooms">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-3">
                  <Users className="mr-2 h-5 w-5" />
                  {t("hero.browseRooms")}
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-3 bg-transparent"
              >
                <Globe className="mr-2 h-5 w-5" />
                {t("hero.exploreDestinations")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-sans text-3xl font-bold text-center mb-12">{t("destinations.title")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("destinations.loading")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-sans text-3xl font-bold text-primary-foreground mb-4">{t("cta.title")}</h2>
          <p className="font-serif text-xl text-primary-foreground/80 mb-8">{t("cta.subtitle")}</p>
          <Link href="/rooms">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-3">
              <Globe className="mr-2 h-5 w-5" />
              {t("cta.button")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
