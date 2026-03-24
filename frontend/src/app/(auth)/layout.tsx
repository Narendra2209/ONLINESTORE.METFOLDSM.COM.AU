import { Shield, Truck, Users, Star } from 'lucide-react';

const features = [
  { icon: Shield, text: 'Quality guaranteed on all products' },
  { icon: Truck, text: 'Fast Australia-wide delivery' },
  { icon: Users, text: 'Dedicated trade support team' },
  { icon: Star, text: 'Exclusive trade pricing available' },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-200px)] bg-steel-50">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 bg-gradient-to-br from-steel-900 via-steel-800 to-brand-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -left-20 w-80 h-80 rounded-full bg-brand-500 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-accent-500 blur-3xl" />
        </div>
        <div className="relative flex flex-col justify-center px-12 py-16 text-white">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Your trusted partner for<br />
            <span className="text-brand-400">sheet metal supplies</span>
          </h2>
          <p className="mt-4 text-steel-300 leading-relaxed max-w-sm">
            Premium roofing, cladding, and industrial sheet metal products for residential and commercial projects.
          </p>
          <div className="mt-10 space-y-4">
            {features.map((feature) => (
              <div key={feature.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <feature.icon className="h-4 w-4 text-brand-400" />
                </div>
                <span className="text-sm text-steel-300">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center py-12 px-4 sm:px-8">
        <div className="w-full max-w-md animate-fade-in-up">{children}</div>
      </div>
    </div>
  );
}
