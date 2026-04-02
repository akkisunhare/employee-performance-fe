
// import React from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "./ui/table";
// import { Checkbox } from "@/components/ui/checkbox";
// import { CheckIcon } from "lucide-react"; // importing Check icon from lucide-react (shadcn uses lucide)

// interface RolesData {
//   role: string;
//   create: boolean;
//   read: boolean;
//   edit: boolean;
//   delete: boolean;
// }

// interface RolesPermissionTableProps {
//   rolesData: RolesData[];
// }

// const RolesPermissionsTable: React.FC<RolesPermissionTableProps> = ({
//   rolesData,
// }) => {
//   const [data, setData] = React.useState<RolesData[]>(rolesData);

//   const handleCheckboxChange = (index: number, key: keyof RolesData) => {
//     // const updatedData = [...data];
//     // updatedData[index][key] = !updatedData[index][key];
//     // setData(updatedData);
//   };

//   return (
//     <Table className="border-2 border-[#27272A]">
//       <TableHeader>
//         <TableRow className="border-2 border-[#27272A]">
//           <TableHead className="text-[#A1A1AA] px-7 py-3">Role</TableHead>
//           <TableHead className="w-60 text-[#A1A1AA]">Create</TableHead>
//           <TableHead className="w-60 text-[#A1A1AA]">Read</TableHead>
//           <TableHead className="w-60 text-[#A1A1AA]">Edit</TableHead>
//           <TableHead className="w-60 text-[#A1A1AA]">Delete</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {data.map((row, index) => (
//           <TableRow className="border-2 border-[#27272A]" key={index}>
//             <TableCell className="text-[#FAFAFA] py-4 px-7">
//               {row.role}
//             </TableCell>

//             {["create", "read", "edit", "delete"].map((key) => (
//               <TableCell key={key}>
//                 <div className="flex justify-start items-center">
//                   <Checkbox
//                     // checked={row[key as keyof RolesData ]}
//                     onCheckedChange={() =>
//                       handleCheckboxChange(index, key as keyof RolesData)
//                     }
//                     // className={`h-5 w-5 border-2 border-[#FAFAFA]
//                     //   data-[state=checked]: border-none
//                     //   data-[state=checked]:bg-transparent
//                     //   relative
//                     // `}
//                     className={`h-5 w-5 border-2 border-[#FAFAFA] cursor-pointer relative
//                         data-[state=checked]:border-none
//                         data-[state=checked]:bg-transparent
                        
//                         data-[state=unchecked]:after:content-none
//                       `}
//                   >
//                     {row[key as keyof RolesData] && (
//                       <CheckIcon
//                         className="absolute w-4 h-4 text-white pointer-events-none"
//                         strokeWidth={3}
//                       />
//                     )}
//                   </Checkbox>
//                 </div>
//               </TableCell>
//             ))}
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   );
// };

// export default RolesPermissionsTable;
