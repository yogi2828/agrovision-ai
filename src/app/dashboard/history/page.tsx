import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { detectionHistory, cropTypes } from "@/lib/data"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"

export default function HistoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-4">Detection History</h1>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Your Detections</CardTitle>
            <CardDescription>
              A log of all plant disease detections you have performed.
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                {cropTypes.map(crop => (
                  <SelectItem key={crop} value={crop.toLowerCase()}>{crop}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                <TableHead>Crop</TableHead>
                <TableHead>Disease</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detectionHistory.map((detection) => (
                <TableRow key={detection.id}>
                  <TableCell className="hidden sm:table-cell">
                    {detection.image && (
                      <Image
                        alt="Plant image"
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={detection.image.imageUrl}
                        width="64"
                        data-ai-hint={detection.image.imageHint}
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{detection.crop}</TableCell>
                  <TableCell>{detection.disease}</TableCell>
                  <TableCell>
                    <Badge variant={parseFloat(detection.confidence) > 95 ? "default" : "secondary"} className={parseFloat(detection.confidence) > 95 ? "bg-green-600/20 text-green-800 dark:bg-green-400/20 dark:text-green-300" : ""}>
                      {detection.confidence}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {detection.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <FileDown className="h-4 w-4 mr-2"/>
                      Report
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
