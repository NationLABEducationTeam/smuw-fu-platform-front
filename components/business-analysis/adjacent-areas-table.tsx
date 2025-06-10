import { BusinessAnalysisResponse } from "@/types/business"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function AdjacentAreasTable({ data }: { data: BusinessAnalysisResponse['adjacent'] }) {
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">지역명</TableHead>
            <TableHead className="text-right">영업 기간</TableHead>
            <TableHead className="text-right">폐업 기간</TableHead>
            <TableHead className="text-center">상권 변화</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(data).map(([name, area]) => (
            <TableRow key={name}>
              <TableCell className="font-medium">{area.adstrd_cd_nm}</TableCell>
              <TableCell className="text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">
                        {area.operation.local.toFixed(1)}
                        <span className="text-sm text-muted-foreground ml-1">개월</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>영업 기간: {area.operation.local.toFixed(1)} 개월</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">
                        {area.closure.local.toFixed(1)}
                        <span className="text-sm text-muted-foreground ml-1">개월</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>폐업 기간: {area.closure.local.toFixed(1)} 개월</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={
                    area.commercial_change === '상권확장' ? 'success' :
                    area.commercial_change === '정체' ? 'warning' :
                    'destructive'
                  }
                >
                  {area.commercial_change}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}