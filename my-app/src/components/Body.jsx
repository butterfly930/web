import {
    Card, 
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Button
} from "@material-tailwind/react";

export  default function Body() {
    return(
        <>
        <p>Bodyyyyy</p>
        <input
                        type="search"
                        className="gap-4 w-48 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                        style={{alignItems: "right", textAlign:"left", marginLeft:"auto", paddingBottom:"20px",paddingRight:"60%", position:"relative", top:"2px", border:"1px solid white", padding:"5px", borderRadius:"5px", color:"white"}}
                        placeholder="Search products..."
                    />

        <Card className="mt-6 w-96">
        <CardHeader color="blue" className="relative h-56">
            <img
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="img-blur-shadow"
            layout="fill"
            className="h-full w-full object-cover"
            />
        </CardHeader>
        <CardBody>
            <Typography variant="h5" className="mb-2">
            Card Title
            </Typography>
            <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
            vulputate libero et velit interdum, ac aliquet odio mattis.
            </Typography>
        </CardBody>
        <CardFooter className="pt-0">
            <Button>Read More</Button>
        </CardFooter>
        </Card>
        </>
    )
}