import { useState } from "react";
import { PublicLayout } from "@/components/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Camera, 
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import buildingImg1 from "@assets/home_entrance.png";
import buildingImg2 from "@assets/home_entrance2.png";
import assemblyImg1 from "@assets/hero_2.jpg";
import assemblyImg2 from "@assets/hero_assembly.jpg";
import assemblyImg3 from "@assets/hero_3.jpg";
import studentsImg1 from "@assets/hero_1.jpg";
import studentsImg2 from "@assets/hero_indoor1.jpg";
import exerciseImg from "@assets/home_6.jpg";
import classroomImg1 from "@assets/classroom_1.png";
import classroomImg2 from "@assets/classroom_2.png";
import classroomImg3 from "@assets/classroom_3.png";
import labImg1 from "@assets/lab_1.png";
import labImg2 from "@assets/lab_3.png";
import labImg3 from "@assets/lab_4.png";
import labImg4 from "@assets/lab_6.png";
import sportsImg1 from "@assets/sports_1.png";
import sportsImg2 from "@assets/sports_2.png";
import sportsImg3 from "@assets/sports_3.png";
import sportsImg4 from "@assets/sports_6.png";
import teachersImg from "@assets/teachers_group.png";
import prayerImg from "@assets/hero_building.png";

const categories = [
  "All",
  "Campus",
  "Daily Life",
  "Sports",
  "Academics",
  "Labs",
  "Faculty",
];

const galleryItems = [
  { id: 1, title: "School Building", category: "Campus", description: "The majestic Aashley International School campus", size: "large" as const, image: buildingImg1 },
  { id: 2, title: "Morning Assembly", category: "Daily Life", description: "Students gathered for the morning assembly", size: "medium" as const, image: assemblyImg1 },
  { id: 3, title: "Smart Board Teaching", category: "Academics", description: "Chemistry class with interactive smart board", size: "medium" as const, image: labImg1 },
  { id: 4, title: "Chess Club", category: "Sports", description: "Student developing strategic thinking through chess", size: "small" as const, image: sportsImg1 },
  { id: 5, title: "Pre-Primary Assembly", category: "Daily Life", description: "Young students in formation during morning assembly", size: "small" as const, image: assemblyImg2 },
  { id: 6, title: "Science Lab", category: "Labs", description: "Students conducting physics experiments", size: "small" as const, image: labImg2 },
  { id: 7, title: "Trophy Winners", category: "Sports", description: "Girls volleyball team with championship trophy", size: "medium" as const, image: sportsImg2 },
  { id: 8, title: "Campus Panorama", category: "Campus", description: "Students at assembly with school building backdrop", size: "large" as const, image: buildingImg2 },
  { id: 9, title: "Physical Training", category: "Daily Life", description: "Students participating in morning exercises", size: "small" as const, image: exerciseImg },
  { id: 10, title: "Classroom Learning", category: "Academics", description: "Senior students studying with teacher supervision", size: "medium" as const, image: classroomImg1 },
  { id: 11, title: "Senior Students", category: "Daily Life", description: "Senior girls during school assembly", size: "small" as const, image: studentsImg2 },
  { id: 12, title: "Creative Learning", category: "Academics", description: "Young student engaged in classroom activities", size: "small" as const, image: prayerImg },
  { id: 13, title: "Lab Experiments", category: "Labs", description: "Students with physics lab equipment", size: "small" as const, image: labImg3 },
  { id: 14, title: "Our Faculty", category: "Faculty", description: "The dedicated teaching team of Aashley International", size: "large" as const, image: teachersImg },
  { id: 15, title: "Outdoor Sports", category: "Sports", description: "Students enjoying outdoor activities", size: "small" as const, image: sportsImg3 },
  { id: 16, title: "Classroom Session", category: "Academics", description: "Interactive classroom learning", size: "medium" as const, image: classroomImg2 },
  { id: 17, title: "Junior Students", category: "Daily Life", description: "Pre-primary students in school uniform", size: "small" as const, image: assemblyImg3 },
  { id: 18, title: "Team Sports", category: "Sports", description: "Students competing in team sports", size: "small" as const, image: sportsImg4 },
  { id: 19, title: "Science Practical", category: "Labs", description: "Hands-on learning in the science laboratory", size: "medium" as const, image: labImg4 },
  { id: 20, title: "Senior Classroom", category: "Academics", description: "Students focused on their studies", size: "small" as const, image: classroomImg3 },
  { id: 21, title: "Boys Assembly", category: "Daily Life", description: "Boys standing in formation during assembly", size: "small" as const, image: studentsImg1 },
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
      <section className="relative py-20">
        <div className="absolute inset-0">
          <img src={buildingImg2} alt="Aashley International School" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
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
                <div className={`relative ${
                  item.size === "large" ? "aspect-square" : 
                  item.size === "medium" ? "aspect-[3/4]" : "aspect-square"
                }`}>
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
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
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
              data-testid="button-close-lightbox"
            >
              <X className="h-6 w-6" />
            </Button>

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

            {selectedImage && (() => {
              const item = filteredItems.find(i => i.id === selectedImage);
              return item ? (
                <div className="flex flex-col items-center">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="max-h-[80vh] w-full object-contain"
                  />
                  <div className="p-4 text-center">
                    <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-white/70 text-sm">{item.description}</p>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Instagram Wall with real images */}
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
            {[assemblyImg2, sportsImg2, classroomImg1, prayerImg, labImg1, exerciseImg].map((img, index) => (
              <div 
                key={index}
                className="aspect-square overflow-hidden rounded-lg hover-elevate cursor-pointer"
                data-testid={`instagram-item-${index}`}
              >
                <img src={img} alt={`School life ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
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
