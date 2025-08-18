import { Clock, Star, MapPin } from "lucide-react";

const WhyChooseUs = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose HostelHub?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We make hostel dining convenient, delicious, and affordable for students
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Item 1 */}
          <div className="text-center p-6 bg-card rounded-2xl shadow hover:shadow-lg transition-all">
            <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quick Service</h3>
            <p className="text-muted-foreground">
              Fast preparation and delivery times to fit your busy schedule
            </p>
          </div>
          
          {/* Item 2 */}
          <div className="text-center p-6 bg-card rounded-2xl shadow hover:shadow-lg transition-all">
            <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quality Food</h3>
            <p className="text-muted-foreground">
              Fresh ingredients and authentic recipes for the best taste
            </p>
          </div>
          
          {/* Item 3 */}
          <div className="text-center p-6 bg-card rounded-2xl shadow hover:shadow-lg transition-all">
            <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Convenient Location</h3>
            <p className="text-muted-foreground">
              Located right in your hostel for maximum convenience
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
