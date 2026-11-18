import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { PageRoute } from '../components/Navbar.tsx';
import { LearnSubnav } from '../components/LearnSubnav.tsx';
import { ResilientImage } from '../components/ResilientImage.tsx';

interface AboutPageProps {
  onNavigate: (page: PageRoute) => void;
}

const BALANCED_IMAGE = '/src/assets/images/about_balanced_plate_1794995822234.jpg';

const PLATE_SEGMENTS = [
  {
    id: 'produce',
    label: '50% Vegetables & Fruits',
    share: '50%',
    color: 'bg-[#15803D]',
    examples: 'Spinach, broccoli, bell peppers, berries, kiwi, citrus fruits',
    role: 'Delivers dietary fiber, potassium, Vitamin C, folate, and protective carotenoids with minimal energy density.',
  },
  {
    id: 'grains',
    label: '25% Whole Grains',
    share: '25%',
    color: 'bg-[#CA8A04]',
    examples: 'Rolled oats, quinoa, brown rice, whole-grain bread, millet',
    role: 'Supplies steady slow-release glucose, B-complex vitamins, magnesium, and prebiotic bran fiber.',
  },
  {
    id: 'protein',
    label: '25% Quality Proteins',
    share: '25%',
    color: 'bg-[#166534]',
    examples: 'Wild salmon, lentils, chickpeas, farm eggs, Greek yogurt, tofu',
    role: 'Provides essential amino acids for muscle maintenance, enzyme synthesis, and lasting meal satiety.',
  },
];

export function AboutPage({ onNavigate }: AboutPageProps) {
  const [selectedSegment, setSelectedSegment] = useState(PLATE_SEGMENTS[0].id);
  const activePlate = PLATE_SEGMENTS.find((s) => s.id === selectedSegment) ?? PLATE_SEGMENTS[0];

  return (
    <div>
      <LearnSubnav activePage="about" onNavigate={onNavigate} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-16">
        {/* Intro Header */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-sm font-medium text-[#15803D]">Foundations of Human Nutrition</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#142419] text-balance">
              What nutrition means and why a balanced diet matters every day.
            </h1>
            <p className="text-base text-[#475B4B] leading-relaxed">
              Nutrition is the biological science of how living organisms obtain and utilize nutrients
              from food to sustain growth, tissue repair, metabolism, and immune defense. Good nutrition
              does not rely on extreme restriction; it depends on consistent variety, appropriate proportions,
              and clean hydration.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-[#E2E8E2] bg-[#F4F7F4]">
              <ResilientImage
                src={BALANCED_IMAGE}
                alt="Overhead view of a balanced healthy meal plate"
                className="w-full h-full object-cover"
                fallbackTitle="Balanced Diet Plate"
              />
            </div>
          </div>
        </section>

        {/* Meaning & 4 Stages of Nutrition */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-[#142419]">
              How Your Body Processes Food
            </h2>
            <p className="text-sm sm:text-base text-[#475B4B] max-w-2xl">
              From the first bite to cellular energy, nutrition operates across four coordinated physiological stages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: '01',
                title: 'Ingestion & Digestion',
                desc: 'Mechanical chewing and digestive enzymes break complex starches, proteins, and fats into absorbable monomers.',
              },
              {
                step: '02',
                title: 'Intestinal Absorption',
                desc: 'Small intestinal villi transport glucose, amino acids, fatty acids, vitamins, and minerals into blood and lymph.',
              },
              {
                step: '03',
                title: 'Cellular Assimilation',
                desc: 'Cells convert absorbed nutrients into ATP energy, structural proteins, hemoglobin, and signaling molecules.',
              },
              {
                step: '04',
                title: 'Metabolic Balance',
                desc: 'Water and fiber clear metabolic byproducts while storing reserve glycogen and fat-soluble vitamins safely.',
              },
            ].map((stage) => (
              <div key={stage.step} className="bg-white border border-[#E2E8E2] rounded-2xl p-5 space-y-2">
                <div className="font-mono-nums text-xs font-semibold text-[#15803D]">{stage.step}</div>
                <h3 className="font-display text-base font-semibold text-[#142419]">{stage.title}</h3>
                <p className="text-sm text-[#475B4B] leading-relaxed">{stage.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Balanced Diet Plate Explorer */}
        <section className="bg-[#FEFCE8] border border-[#EDE9C6] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-[#854D0E]">Interactive Meal Guide</p>
              <h2 className="font-display text-2xl font-bold text-[#142419]">
                The Balanced Plate Proportion Model
              </h2>
              <p className="text-sm text-[#475B4B]">
                Select any section of the balanced plate below to inspect its ideal share, food examples, and role.
              </p>
            </div>
          </div>

          {/* Interactive Proportion Bar */}
          <div className="space-y-3">
            <div className="h-4 w-full rounded-full overflow-hidden flex border border-[#E2E8E2] bg-white">
              <button
                type="button"
                aria-label="Select 50% Vegetables and Fruits"
                onClick={() => setSelectedSegment('produce')}
                className="w-1/2 bg-[#15803D] hover:opacity-90 transition-opacity cursor-pointer"
              />
              <button
                type="button"
                aria-label="Select 25% Whole Grains"
                onClick={() => setSelectedSegment('grains')}
                className="w-1/4 bg-[#CA8A04] hover:opacity-90 transition-opacity cursor-pointer"
              />
              <button
                type="button"
                aria-label="Select 25% Quality Proteins"
                onClick={() => setSelectedSegment('protein')}
                className="w-1/4 bg-[#14532D] hover:opacity-90 transition-opacity cursor-pointer"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {PLATE_SEGMENTS.map((seg) => (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => setSelectedSegment(seg.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                    selectedSegment === seg.id
                      ? 'bg-[#15803D] text-white border-[#15803D]'
                      : 'bg-white text-[#142419] border-[#E2E8E2] hover:border-[#15803D]'
                  }`}
                >
                  {seg.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E2E8E2] rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-[#475B4B]">Recommended Meal Share</div>
              <div className="font-mono-nums text-3xl font-bold text-[#15803D] mt-1">
                {activePlate.share}
              </div>
              <div className="text-sm font-semibold text-[#142419] mt-1">{activePlate.label}</div>
            </div>
            <div>
              <div className="text-xs text-[#475B4B]">Everyday Food Examples</div>
              <p className="text-sm text-[#142419] mt-1 font-medium">{activePlate.examples}</p>
            </div>
            <div>
              <div className="text-xs text-[#475B4B]">Physiological Benefit</div>
              <p className="text-sm text-[#475B4B] mt-1">{activePlate.role}</p>
            </div>
          </div>
        </section>

        {/* Benefits of Healthy Eating */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-3">
            <h2 className="font-display text-2xl font-bold text-[#142419]">
              Core Benefits of Healthy Eating Habits
            </h2>
            <p className="text-sm sm:text-base text-[#475B4B]">
              Consistent whole-food habits support both immediate daily stamina and long-term preventive health.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('nutrients')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-xl transition-colors cursor-pointer"
              >
                <span>Explore the 6 Core Nutrients</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Maintains healthy body weight without restrictive crash dieting',
              'Supports digestive regularity and diverse gut microbiome balance',
              'Reduces risk of hypertension, type 2 diabetes, and heart disease',
              'Improves sleep quality, mood stability, and daytime alertness',
              'Promotes healthy childhood growth and cognitive development',
              'Prevents micronutrient deficiencies like iron-deficiency anaemia',
            ].map((benefit) => (
              <div
                key={benefit}
                className="flex items-start gap-3 bg-white border border-[#E2E8E2] rounded-xl p-4"
              >
                <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-[#142419]">{benefit}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
