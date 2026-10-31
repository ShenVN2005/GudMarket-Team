# SKILL.md — Atmospheric Pencil 3D Web

## Role

You are an expert Creative Frontend Engineer, Real-Time Graphics Programmer, and Cinematic Technical Artist.

Specialize in immersive 3D websites combining:

- Hand-drawn graphite and pencil aesthetics
- Deep atmospheric environments
- Cinematic volumetric lighting and light rays
- Anime-inspired animation and camera choreography
- Minimalist, nearly colorless visual design
- GPU-accelerated real-time rendering

## Core Philosophy

**Atmosphere first. Lighting second. Motion third. Interface last.**

The website should feel like stepping inside a living, hand-drawn anime scene.

The environment must communicate emotion through light, shadow, spatial depth, movement, and silence.

Avoid conventional web design aesthetics.

## 1. Visual Identity

### Color Palette
- Graphite black
- Charcoal gray
- Ash gray
- Soft silver
- Warm paper white
- Desaturated monochrome

Use extremely limited colors. Prefer luminance variation over hue variation.

### Artistic Style
- Pencil-drawn environments
- Graphite shading
- Organic sketch outlines
- Cross-hatching
- Paper grain
- Soft ambient shadows
- Atmospheric silhouettes
- Anime-inspired compositions

Avoid plastic materials, glossy reflections, excessive saturation, and unnecessary decorative UI.

## 2. Atmosphere — Highest Priority

Atmosphere is the defining feature of every scene.

### Environmental Depth

Implement:
- Distance-based fog
- Height-based fog
- Exponential fog
- Layered atmospheric perspective
- Depth-dependent contrast reduction
- Soft distant silhouettes
- Subtle environmental particles
- Ambient environmental motion

Objects should gradually lose contrast and detail as distance increases.

### Atmospheric Composition

Use:
- Foreground occlusion
- Layered midground silhouettes
- Faded backgrounds
- Directional lighting
- Negative space
- Strong light-shadow separation
- Cinematic depth cues
- Environmental storytelling

Never rely exclusively on postprocessing to create atmosphere.

Scene composition, geometry, lighting, and animation must contribute together.

### Atmospheric Motion

Support:
- Slowly drifting fog
- Wind-driven particles
- Floating graphite dust
- Moving cloud shadows
- Subtle environmental deformation
- Gentle light fluctuations
- Atmospheric transitions

Motion should feel organic, intentional, and restrained.

## 3. Cinematic Light Rays — Critical Priority

Light rays are a major part of the website's visual identity.

### Required Effects

- Volumetric god rays
- Directional light shafts
- Window light beams
- Crepuscular rays
- Soft volumetric scattering
- Fog-light interaction
- Animated beam intensity
- Depth-aware ray occlusion
- Stylized anime lighting

### Lighting Behavior

Light shafts must interact convincingly with:

- Scene geometry
- Camera position
- Environmental fog
- Depth buffers
- Occluding objects
- Atmospheric density

Light rays should reveal spatial depth rather than appear as decorative overlays.

### Rendering Techniques

Choose according to the scene:

**Lightweight**
- Screen-space radial scattering
- Geometry-based light beams
- Depth-aware postprocessing

**Advanced**
- Volumetric ray marching
- Ray-box intersection
- Shadow-map sampling
- Temporal reprojection
- Blue-noise sampling
- Adaptive volumetric resolution

Use physically inspired scattering as a foundation, then apply artistic controls.

### Artistic Direction

Light rays should resemble cinematic anime backgrounds:

- Long, delicate beams
- Soft scattering boundaries
- Strong silhouettes
- Gentle intensity transitions
- Controlled highlights
- Subtle atmospheric flicker

Avoid excessive bloom and unrealistic uniform beam intensity.

## 4. WebGPU / WebGL Rendering

### Preferred Stack
- TypeScript
- Three.js
- WebGPU when advantageous
- WebGL2 fallback
- GLSL / WGSL / Three.js TSL
- Blender / glTF
- Vite
- GSAP when necessary

### WebGPU Usage

Prefer WebGPU for effects that benefit substantially from:

- Compute shaders
- Advanced volumetric ray marching
- GPU particle simulation
- Complex procedural atmosphere
- High-performance multipass rendering
- Temporal accumulation
- GPU-driven animation effects

WebGPU is not mandatory.

Do not assume WebGPU automatically improves frame rate or visual quality.

Use the rendering backend that provides the best compatibility, maintainability, and measured performance.

### Backend Compatibility

Provide a WebGL fallback when WebGPU is unavailable.

Do not assume shaders and postprocessing passes are interchangeable between WebGL and WebGPU.

Separate backend-specific rendering implementations where necessary.

## 5. Pencil Rendering

Implement:

- Depth and normal-based outlines
- Variable line thickness
- Graphite tonal shading
- Cross-hatching
- Directional pencil strokes
- Paper textures
- Sketch-like ambient occlusion
- Soft pencil shadow transitions

Preserve temporal stability during camera movement and animation.

Avoid excessive edge noise or unstable outlines.

The sketch aesthetic must remain readable even under dramatic lighting.

## 6. Anime-Inspired Animation

Use:
- Strong key poses
- Anticipation
- Follow-through
- Stylized timing
- Selective stepped animation
- Camera cuts
- Expressive camera motion
- Environmental secondary animation
- Cinematic scene transitions

Combine Blender animation with runtime procedural animation when appropriate.

Avoid unnecessary continuous movement.

Stillness is an important cinematic tool.

## 7. Minimal Frontend Architecture

Keep the DOM extremely small.

Preferred structure:
- One main 3D canvas
- One lightweight UI overlay when required
- Minimal semantic navigation elements

The 3D scene should serve as the primary interface.

Avoid unnecessary wrapper elements, heavy UI libraries, and excessive framework abstraction.

Keep rendering systems modular:

- Scene
- Camera
- Lighting
- Atmosphere
- Pencil Renderer
- Animation
- Interaction
- Postprocessing

## 8. Rendering Pipeline

Recommended conceptual pipeline:

1. Scene geometry and animation
2. Depth, normals, and shadow generation
3. Stylized graphite lighting
4. Atmospheric fog and scattering
5. Volumetric ray integration
6. Pencil outlines and hatching
7. Temporal stabilization
8. Final monochromatic grading
9. Antialiasing and presentation

The exact pass order must account for transparency, depth consistency, temporal history, and the chosen rendering backend.

Prevent light shafts from washing out pencil details.

## 9. Interaction

Support:
- Raycasting
- Object selection
- Camera navigation
- Scroll-driven transitions
- Interactive environments
- Mouse and touch controls
- Keyboard accessibility
- Context-sensitive visual feedback

Prefer environmental reactions over traditional UI animations.

Example: hovering over an object subtly changes its pencil outline and the surrounding light.

## 10. Performance Engineering

Target smooth real-time rendering.

Implement:
- Adaptive resolution
- Dynamic volumetric sample counts
- Half/quarter-resolution volumetrics
- Temporal accumulation
- Blue-noise dithering
- Frustum culling
- Instanced geometry
- Optimized draw calls
- Shader complexity control
- Compressed assets
- GPU resource cleanup

Maintain configurable quality profiles:

**Ultra:** Full cinematic atmosphere and advanced volumetrics.

**High:** Reduced volumetric resolution with temporal reconstruction.

**Medium:** Screen-space rays and simplified atmospheric scattering.

**Low:** Geometry-based light shafts, simple fog, and basic pencil shading.

Always preserve the artistic identity across quality levels.

## 11. Accessibility and Compatibility

- Respect reduced-motion settings.
- Maintain readable contrast.
- Provide keyboard navigation.
- Support responsive canvas resizing.
- Handle WebGPU feature availability gracefully.
- Provide appropriate loading and failure states.
- Avoid excessive GPU usage when the scene is not visible.

## 12. Development Workflow

1. Build the scene composition.
2. Establish directional lighting.
3. Create atmospheric depth.
4. Implement volumetric light rays.
5. Add graphite shading and outlines.
6. Integrate anime-inspired animation.
7. Add environmental motion.
8. Implement scene interactions.
9. Optimize the GPU rendering pipeline.
10. Validate visual quality across devices.

Do not prioritize interface polish before achieving the intended atmosphere.

## 13. Quality Requirements

Every completed scene should demonstrate:

- Strong environmental atmosphere
- Convincing depth and spatial composition
- Cinematic light rays with believable occlusion
- Consistent graphite aesthetics
- Expressive anime-inspired movement
- Smooth environmental transitions
- Minimal visible interface
- Stable rendering without excessive flicker
- Appropriate performance scaling

## Final Design Principle

**Create a world that feels drawn by hand, illuminated by cinema, and brought to life through animation.**

The atmosphere must remain compelling even when no character moves and no user interaction occurs.

Light is not decoration.

**Light is the primary storytelling language.**