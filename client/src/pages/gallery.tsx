import { useState } from "react";
import { PublicLayout } from "@/components/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Camera, 
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin
} from "lucide-react";

const categories = [
  "All",
  "Events",
  "Daily Life",
  "Sports",
  "Arts & Culture",
  "Academics",
  "Campus",
];

const galleryItems = [
  { id: 1, title: "Annual Day 2024", category: "Events", description: "Students performing at the annual cultural festival", size: "large" },
  { id: 2, title: "Morning Assembly", category: "Daily Life", description: "Students gathered for the morning prayer", size: "medium" },
  { id: 3, title: "Science Exhibition", category: "Academics", description: "Innovative projects by students", size: "medium" },
  { id: 4, title: "Sports Day", category: "Sports", description: "Inter-house athletics competition", size: "small" },
  { id: 5, title: "Art Class", category: "Arts & Culture", description: "Creative expression in art studio", size: "small" },
  { id: 6, title: "Library Session", category: "Academics", description: "Students exploring the world of books", size: "small" },
  { id: 7, title: "Music Practice", category: "Arts & Culture", description: "Instrumental training session", size: "medium" },
  { id: 8, title: "Campus View", category: "Campus", description: "Aerial view of our beautiful campus", size: "large" },
  { id: 9, title: "Basketball Match", category: "Sports", description: "Inter-school basketball tournament", size: "small" },
  { id: 10, title: "Independence Day", category: "Events", description: "Flag hoisting ceremony", size: "medium" },
  { id: 11, title: "Classroom Learning", category: "Daily Life", description: "Interactive learning session", size: "small" },
  { id: 12, title: "Dance Performance", category: "Arts & Culture", description: "Classical dance at cultural event", size: "small" },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const filteredItems = selectedCategory === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  const currentImageIndex = selectedImage !== null 
    ? filteredItems.findIndex(item => item.id === selectedImage) 
    : -1;

  const navigateImage = (direction: "prev" | "next") => {
    if (currentImageIndex === -1) return;
    const newIndex = direction === "prev" 
      ? (currentImageIndex - 1 + filteredItems.length) % filteredItems.length
      : (currentImageIndex + 1) % filteredItems.length;
    setSelectedImage(filteredItems[newIndex].id);
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground" data-testid="badge-gallery">
              Photo Stories
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Moments of <span className="text-accent">Learning & Joy</span>
            </h1>
            <p className="text-lg opacity-90">
              Capturing the essence of life at Aashley - where every day brings new 
              experiences and memories.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b sticky top-16 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                data-testid={`filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`group relative cursor-pointer overflow-hidden rounded-lg ${
                  item.size === "large" ? "col-span-2 row-span-2" : 
                  item.size === "medium" ? "col-span-1 row-span-2 md:col-span-1" : ""
                }`}
                onClick={() => setSelectedImage(item.id)}
                data-testid={`gallery-item-${item.id}`}
              >
                <div className={`bg-gradient-to-br from-primary/20 to-accent/20 relative ${
                  item.size === "large" ? "aspect-square" : 
                  item.size === "medium" ? "aspect-[3/4]" : "aspect-square"
                }`}>
                  {/* Placeholder for image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-primary/30" />
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-white">
                    <h4 className="font-semibold text-center mb-1">{item.title}</h4>
                    <p className="text-sm text-center opacity-80">{item.description}</p>
                    <Badge className="mt-3 bg-accent text-accent-foreground">{item.category}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No images found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Dialog */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/90 border-0">
          <div className="relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
              data-testid="button-close-lightbox"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={() => navigateImage("prev")}
              data-testid="button-prev-image"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={() => navigateImage("next")}
              data-testid="button-next-image"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            {/* Image content */}
            {selectedImage && (
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center p-8">
                  <Camera className="h-24 w-24 text-white/30 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {filteredItems.find(i => i.id === selectedImage)?.title}
                  </h3>
                  <p className="text-white/70">
                    {filteredItems.find(i => i.id === selectedImage)?.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Instagram Wall Teaser */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Follow Us on <span className="text-primary">Instagram</span>
            </h2>
            <p className="text-muted-foreground">
              Stay updated with daily moments from #AashleyLife
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[...Array(6)].map((_, index) => (
              <div 
                key={index}
                className="aspect-square bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg flex items-center justify-center hover-elevate cursor-pointer"
                data-testid={`instagram-item-${index}`}
              >
                <Camera className="h-8 w-8 text-primary/30" />
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" data-testid="button-follow-instagram">
              Follow @AashleySchool
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
