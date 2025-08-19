"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Tablet, Monitor, Headphones, RotateCcw, Maximize, Volume2, Settings, Info } from "lucide-react"
import { useDevice } from "@/hooks/use-device"
import { useState } from "react"

interface DeviceOptimizedControlsProps {
  onResetView?: () => void
  onToggleFullscreen?: () => void
  onVolumeToggle?: () => void
  onShowSettings?: () => void
  onShowInfo?: () => void
}

export function DeviceOptimizedControls({
  onResetView,
  onToggleFullscreen,
  onVolumeToggle,
  onShowSettings,
  onShowInfo,
}: DeviceOptimizedControlsProps) {
  const device = useDevice()
  const [showInstructions, setShowInstructions] = useState(false)

  const getDeviceIcon = () => {
    switch (device.type) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Tablet className="h-4 w-4" />
      case "vr":
        return <Headphones className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getDeviceInstructions = () => {
    switch (device.type) {
      case "mobile":
        return {
          title: "Mobile VR Controls",
          instructions: [
            "Rotate your phone to look around naturally",
            "Touch and drag to manually control view",
            "Use headphones for immersive audio",
            "Hold phone horizontally for best experience",
          ],
        }
      case "tablet":
        return {
          title: "Tablet VR Controls",
          instructions: [
            "Tilt tablet to look around",
            "Touch and drag for precise control",
            "Use landscape mode for wider view",
            "Connect headphones for better audio",
          ],
        }
      case "vr":
        return {
          title: "VR Headset Controls",
          instructions: [
            "Move your head naturally to look around",
            "Use hand controllers if available",
            "Adjust headset for comfort",
            "Ensure good lighting for tracking",
          ],
        }
      default:
        return {
          title: "Desktop VR Controls",
          instructions: [
            "Click and drag to look around",
            "Use mouse wheel to zoom",
            "Press F for fullscreen",
            "Use arrow keys for navigation",
          ],
        }
    }
  }

  const instructions = getDeviceInstructions()

  return (
    <div className="space-y-4">
      {/* Device Info Bar */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          {getDeviceIcon()}
          <span className="font-serif text-sm text-foreground capitalize">
            {device.type} • {device.platform}
          </span>
          {device.hasVRSupport && (
            <Badge variant="secondary" className="text-xs">
              VR Ready
            </Badge>
          )}
          {device.hasGyroscope && (
            <Badge variant="secondary" className="text-xs">
              Gyroscope
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>

      {/* Device-Specific Instructions */}
      {showInstructions && (
        <Card className="border-border">
          <CardContent className="p-4">
            <h4 className="font-sans font-semibold text-foreground mb-3">{instructions.title}</h4>
            <ul className="space-y-2">
              {instructions.instructions.map((instruction, index) => (
                <li key={index} className="font-serif text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                  {instruction}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Device-Optimized Control Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={onResetView} className="flex items-center gap-2 bg-transparent">
          <RotateCcw className="h-4 w-4" />
          Reset View
        </Button>

        {device.type !== "vr" && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFullscreen}
            className="flex items-center gap-2 bg-transparent"
          >
            <Maximize className="h-4 w-4" />
            Fullscreen
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={onVolumeToggle} className="flex items-center gap-2 bg-transparent">
          <Volume2 className="h-4 w-4" />
          Audio
        </Button>

        <Button variant="outline" size="sm" onClick={onShowSettings} className="flex items-center gap-2 bg-transparent">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Mobile-Specific Features */}
      {(device.type === "mobile" || device.type === "tablet") && (
        <Card className="border-border bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="h-4 w-4 text-primary" />
              <span className="font-sans font-semibold text-sm">Mobile Tips</span>
            </div>
            <div className="space-y-1 text-xs font-serif text-muted-foreground">
              <p>• Rotate to landscape for better experience</p>
              <p>• Enable auto-rotate in device settings</p>
              <p>• Use headphones for spatial audio</p>
              {!device.isStandalone && <p>• Add to home screen for app-like experience</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* VR-Specific Features */}
      {device.type === "vr" && (
        <Card className="border-border bg-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Headphones className="h-4 w-4 text-accent" />
              <span className="font-sans font-semibold text-sm">VR Mode Active</span>
            </div>
            <div className="space-y-1 text-xs font-serif text-muted-foreground">
              <p>• Head tracking enabled</p>
              <p>• Immersive audio active</p>
              <p>• Hand controllers supported</p>
              <p>• Room-scale tracking available</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
