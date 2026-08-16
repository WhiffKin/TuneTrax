import { useModal } from "../../context/Modal";

function FeatureComingSoonModal(){
    const {closeModal} = useModal();

    return(
        <>
        <h1>Feature coming soon!</h1>
        </>
    )
}

export default FeatureComingSoonModal; 