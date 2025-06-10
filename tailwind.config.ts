
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				outfit: ['Outfit', 'sans-serif'],
				sans: ['Outfit', 'sans-serif'],
			},
			colors: {
				brand: {
					50: "#FFFCF3",
					100: "#FEF9E8",
					200: "#FEEFC4",
					300: "#FDE5A1",
					400: "#FBD25B",
					500: "#F9BF14",
					600: "#E0AC12",
					700: "#95730C",
					800: "#705609",
					900: "#4B3906",
					950: "#322604",
					DEFAULT: "#F9BF14",
				},
				accent: {
					50: "#F4F4F4",
					100: "#E8E8E9",
					200: "#C6C6C8",
					300: "#A3A3A7",
					400: "#5E5E65",
					500: "#191923",
					600: "#171720",
					700: "#0F0F15",
					800: "#0B0B10",
					900: "#08080B",
					950: "#050507",
					DEFAULT: "#191923",
				},
				action: {
					50: "#F2FAFD",
					100: "#E6F4FA",
					200: "#BFE4F3",
					300: "#99D4EB",
					400: "#4DB3DD",
					500: "#0093CE",
					600: "#0084B9",
					700: "#00587C",
					800: "#00425D",
					900: "#002C3E",
					950: "#001D29",
					DEFAULT: "#0093CE",
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
